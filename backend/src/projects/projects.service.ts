import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectInviteRepository } from './repositories/project-invite.repository';
import { ProjectStatus, ProjectType, RoleName } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { ProjectHealthService, ProjectHealthScoreResult, ProjectRiskStatus, ProjectRecommendationsResult } from './project-health.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectInviteRepository: ProjectInviteRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
    private readonly projectHealthService: ProjectHealthService,
  ) {}

  async create(createProjectDto: CreateProjectDto, actorId?: string) {
    const project = await this.projectRepository.create(createProjectDto);
    await this.auditService.log(actorId || null, 'create_project', 'Project', project.id, { title: project.title });
    if (createProjectDto.supervisorId) {
      await this.notificationsService.create({ recipientId: createProjectDto.supervisorId, message: `Project created: ${project.title}`, link: `/projects/${project.id}` });
    }
    return project;
  }

  async findAll(pagination: PaginationDto, userId?: string) {
    return this.projectRepository.findAll(pagination, userId);
  }

  async findOne(id: string) {
    return this.projectRepository.findOne(id);
  }

  async findDetails(id: string) {
    const details = await this.projectRepository.findDetails(id);
    if (!details) return null;

    const [healthScore, riskStatus, recommendations] = await Promise.all([
      this.projectHealthService.compute(id),
      this.projectHealthService.computeRisk(id),
      this.projectHealthService.computeRecommendations(id),
    ]);

    details.healthScore = healthScore;
    details.riskStatus = riskStatus;
    details.recommendedActions = recommendations;
    return details;
  }

  async getHealthScore(id: string): Promise<ProjectHealthScoreResult | null> {
    return this.projectHealthService.compute(id);
  }

  async getRiskStatus(id: string): Promise<ProjectRiskStatus | null> {
    return this.projectHealthService.computeRisk(id);
  }

  async getRecommendations(id: string): Promise<ProjectRecommendationsResult | null> {
    return this.projectHealthService.computeRecommendations(id);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, actorId?: string) {
    const project = await this.projectRepository.update(id, updateProjectDto);
    await this.auditService.log(actorId || null, 'update_project', 'Project', id, updateProjectDto);
    return project;
  }

  async assignSupervisor(id: string, supervisorId: string, actorId?: string) {
    const project = await this.projectRepository.assignSupervisor(id, supervisorId);
    await this.auditService.log(actorId || null, 'assign_supervisor', 'Project', id, { supervisorId });
    await this.notificationsService.create({ recipientId: supervisorId, message: `You were assigned as supervisor to project ${project.title}`, link: `/projects/${id}` });
    return project;
  }

  async updateStatus(id: string, status: ProjectStatus, actorId?: string) {
    const project = await this.projectRepository.updateStatus(id, status);
    await this.auditService.log(actorId || null, 'update_project_status', 'Project', id, { status });
    return project;
  }

  async updateType(id: string, type: ProjectType, actorId?: string) {
    const project = await this.projectRepository.updateType(id, type);
    await this.auditService.log(actorId || null, 'update_project_type', 'Project', id, { type });
    return project;
  }

  async remove(id: string, actorId?: string) {
    const res = await this.projectRepository.remove(id);
    await this.auditService.log(actorId || null, 'delete_project', 'Project', id, {});
    return res;
  }

  async findCollaborators(projectId: string) {
    return this.projectRepository.findCollaborators(projectId);
  }

  async addCollaboratorByEmail(projectId: string, email: string, role?: RoleName, actorId?: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException(`No user found with email ${email}`);
    const result = await this.projectRepository.addCollaborator(projectId, user.id, role);
    await this.auditService.log(actorId || null, 'add_collaborator', 'ProjectAssignment', projectId, { userId: user.id, role });
    await this.notificationsService.create({
      recipientId: user.id,
      message: `You have been added as a collaborator on a project.`,
      link: `/projects/${projectId}`,
    });
    return result;
  }

  async removeCollaborator(projectId: string, userId: string, actorId?: string) {
    const result = await this.projectRepository.removeCollaborator(projectId, userId);
    await this.auditService.log(actorId || null, 'remove_collaborator', 'ProjectAssignment', projectId, { userId });
    return result;
  }

  async createInvite(projectId: string, role: RoleName = RoleName.REVIEWER, createdById: string, expiresInDays?: number) {
    const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 86_400_000) : undefined;
    return this.projectInviteRepository.create(projectId, role, createdById, expiresAt);
  }

  async listInvites(projectId: string) {
    return this.projectInviteRepository.findByProject(projectId);
  }

  async getInviteDetails(token: string) {
    const invite = await this.projectInviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException('Invite link not found or has been revoked.');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new BadRequestException('This invite link has expired.');
    return { projectId: invite.projectId, role: invite.role, project: invite.project };
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.projectInviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException('Invite link not found or has been revoked.');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new BadRequestException('This invite link has expired.');
    await this.projectRepository.addCollaborator(invite.projectId, userId, invite.role);
    await this.projectInviteRepository.incrementUsedCount(token);
    return { projectId: invite.projectId, role: invite.role, project: invite.project };
  }

  async revokeInvite(token: string) {
    return this.projectInviteRepository.revoke(token);
  }
}
