import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { ChannelsService } from '../channels/channels.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectInviteRepository: ProjectInviteRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly usersService: UsersService,
    private readonly projectHealthService: ProjectHealthService,
    private readonly channelsService: ChannelsService,
  ) {}

  async create(createProjectDto: CreateProjectDto, actorId?: string) {
    const project = await this.projectRepository.create(createProjectDto);
    await this.auditService.log(actorId || null, 'create_project', 'Project', project.id, { title: project.title });
    if (createProjectDto.supervisorId) {
      await this.notificationsService.create({
        recipientId: createProjectDto.supervisorId,
        title: 'New proposal awaiting review',
        message: `A student submitted a proposal: "${project.title}"`,
        link: `/supervisor/projects`,
      });
    }
    // Auto-provision discussion channels for this project
    try {
      await this.channelsService.provisionProjectChannels(
        project.id,
        actorId || (createProjectDto as any).studentId || '',
        (createProjectDto as any).studentId,
        createProjectDto.supervisorId,
      );
    } catch { /* non-fatal */ }
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

    // Pass the already-fetched project data to avoid 3 redundant DB round-trips.
    const [healthRes, riskRes, recRes] = await Promise.allSettled([
      this.projectHealthService.compute(id, details),
      this.projectHealthService.computeRisk(id, details),
      this.projectHealthService.computeRecommendations(id, details),
    ]);

    details.healthScore      = healthRes.status === 'fulfilled' ? healthRes.value : null;
    details.riskStatus       = riskRes.status === 'fulfilled'   ? riskRes.value   : null;
    details.recommendedActions = recRes.status === 'fulfilled'  ? recRes.value    : null;
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
    if (updateProjectDto.collaboratorLimit !== undefined) {
      await this.assertSupervisor(id, actorId);
    }
    const project = await this.projectRepository.update(id, updateProjectDto);
    await this.auditService.log(actorId || null, 'update_project', 'Project', id, updateProjectDto);
    return project;
  }

  async assignSupervisor(id: string, supervisorId: string, actorId?: string) {
    const project = await this.projectRepository.assignSupervisor(id, supervisorId);
    await this.auditService.log(actorId || null, 'assign_supervisor', 'Project', id, { supervisorId });
    await this.notificationsService.create({ recipientId: supervisorId, title: 'Project assignment', message: `You were assigned as supervisor to project "${project.title}"`, link: `/supervisor/projects` });
    return project;
  }

  async findProposalsForSupervisor(supervisorId: string) {
    return this.projectRepository.findProposalsForSupervisor(supervisorId);
  }

  async updateStatus(id: string, status: ProjectStatus, actorId?: string) {
    const project = await this.projectRepository.updateStatus(id, status);
    await this.auditService.log(actorId || null, 'update_project_status', 'Project', id, { status });
    // Notify the student when supervisor accepts or rejects their proposal
    if (project && (project as any).studentId) {
      const label = status === ProjectStatus.ACTIVE ? 'accepted' : status === ProjectStatus.CANCELLED ? 'rejected' : status.toLowerCase();
      await this.notificationsService.create({
        recipientId: (project as any).studentId,
        title: `Proposal ${label}`,
        message: `Your proposal "${(project as any).title}" was ${label}.`,
        link: `/student/projects`,
      });
    }
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
    const settings = await this.assertProjectMember(projectId, actorId);
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException(`No user found with email ${email}`);
    const ownerIds = [settings.studentId, settings.supervisorId].filter(Boolean) as string[];
    if (ownerIds.includes(user.id)) throw new BadRequestException('The project owner and supervisor are already part of the project team.');
    // Students can only collaborate on projects supervised by their own advisor
    const advisorId = (user as any).studentProfile?.advisorId;
    if (advisorId && advisorId !== settings.supervisorId) {
      throw new ForbiddenException('This student is assigned to a different supervisor and cannot be added to this project.');
    }
    const existing = (await this.projectRepository.findCollaborators(projectId)).some((assignment: any) => assignment.userId === user.id);
    if (!existing && user.id !== settings.studentId && user.id !== settings.supervisorId) {
      const count = await this.projectRepository.countTeamCollaborators(projectId, ownerIds);
      if (count >= settings.collaboratorLimit) {
        throw new BadRequestException(`This project already has its maximum of ${settings.collaboratorLimit} collaborators.`);
      }
    }
    const result = await this.projectRepository.addCollaborator(projectId, user.id, role);
    await this.channelsService.addProjectMember(projectId, user.id);
    await this.auditService.log(actorId || null, 'add_collaborator', 'ProjectAssignment', projectId, { userId: user.id, role });
    await this.notificationsService.create({
      recipientId: user.id,
      message: `You have been added as a collaborator on a project.`,
      link: `/student/projects/${projectId}`,
    });
    return result;
  }

  async removeCollaborator(projectId: string, userId: string, actorId?: string) {
    await this.assertSupervisor(projectId, actorId);
    const result = await this.projectRepository.removeCollaborator(projectId, userId);
    await this.channelsService.removeProjectMember(projectId, userId);
    await this.auditService.log(actorId || null, 'remove_collaborator', 'ProjectAssignment', projectId, { userId });
    return result;
  }

  async createInvite(projectId: string, role: RoleName = RoleName.REVIEWER, createdById: string, expiresInDays?: number) {
    await this.assertSupervisor(projectId, createdById);
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
    const settings = await this.projectRepository.getCollaborationSettings(invite.projectId);
    if (!settings) throw new NotFoundException('Project not found.');
    const ownerIds = [settings.studentId, settings.supervisorId].filter(Boolean) as string[];
    const existing = (await this.projectRepository.findCollaborators(invite.projectId)).some((assignment: any) => assignment.userId === userId);
    if (!existing && !ownerIds.includes(userId)) {
      const count = await this.projectRepository.countTeamCollaborators(invite.projectId, ownerIds);
      if (count >= settings.collaboratorLimit) throw new BadRequestException('This project has reached its collaborator limit.');
    }
    await this.projectRepository.addCollaborator(invite.projectId, userId, invite.role);
    await this.channelsService.addProjectMember(invite.projectId, userId);
    await this.projectInviteRepository.incrementUsedCount(token);
    return { projectId: invite.projectId, role: invite.role, project: invite.project };
  }

  async revokeInvite(token: string, actorId?: string) {
    const invite = await this.projectInviteRepository.findByToken(token);
    if (!invite) throw new NotFoundException('Invite link not found or has been revoked.');
    await this.assertSupervisor(invite.projectId, actorId);
    return this.projectInviteRepository.revoke(token);
  }

  async updateCollaboratorLimit(projectId: string, collaboratorLimit: number, actorId?: string) {
    const settings = await this.assertSupervisor(projectId, actorId);
    const ownerIds = [settings.studentId, settings.supervisorId].filter(Boolean) as string[];
    const currentCount = await this.projectRepository.countTeamCollaborators(projectId, ownerIds);
    if (collaboratorLimit < currentCount) {
      throw new BadRequestException(`The limit cannot be less than the ${currentCount} current collaborator(s).`);
    }
    return this.projectRepository.updateCollaboratorLimit(projectId, collaboratorLimit);
  }

  private async assertSupervisor(projectId: string, actorId?: string) {
    const settings = await this.projectRepository.getCollaborationSettings(projectId);
    if (!settings) throw new NotFoundException('Project not found.');
    if (!actorId || settings.supervisorId !== actorId) throw new ForbiddenException('Only this project\'s supervisor can manage collaborators.');
    return settings;
  }

  private async assertProjectMember(projectId: string, actorId?: string) {
    const settings = await this.projectRepository.getCollaborationSettings(projectId);
    if (!settings) throw new NotFoundException('Project not found.');
    const isOwner = actorId && (settings.supervisorId === actorId || settings.studentId === actorId);
    if (!isOwner) throw new ForbiddenException('Only this project\'s supervisor or student can manage collaborators.');
    return settings;
  }
}
