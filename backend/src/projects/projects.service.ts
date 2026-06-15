import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ProjectHealthService, ProjectHealthScoreResult, ProjectRiskStatus, ProjectRecommendationsResult } from './project-health.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly projectHealthService: ProjectHealthService,
  ) {}

  async create(createProjectDto: CreateProjectDto, actorId?: string) {
    const project = await this.projectRepository.create(createProjectDto);
    await this.auditService.log(actorId || null, 'create_project', 'Project', project.id, { title: project.title });
    await this.notificationsService.create({ recipientId: createProjectDto.supervisorId || '', message: `Project created: ${project.title}`, link: `/projects/${project.id}` });
    return project;
  }

  async findAll(pagination: PaginationDto) {
    return this.projectRepository.findAll(pagination);
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
}
