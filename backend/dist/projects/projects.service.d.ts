import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ProjectRepository } from './repositories/project.repository';
import { ProjectStatus, ProjectType } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
import { ProjectHealthService, ProjectHealthScoreResult, ProjectRiskStatus, ProjectRecommendationsResult } from './project-health.service';
export declare class ProjectsService {
    private readonly projectRepository;
    private readonly notificationsService;
    private readonly auditService;
    private readonly projectHealthService;
    constructor(projectRepository: ProjectRepository, notificationsService: NotificationsService, auditService: AuditService, projectHealthService: ProjectHealthService);
    create(createProjectDto: CreateProjectDto, actorId?: string): Promise<any>;
    findAll(pagination: PaginationDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findDetails(id: string): Promise<any>;
    getHealthScore(id: string): Promise<ProjectHealthScoreResult | null>;
    getRiskStatus(id: string): Promise<ProjectRiskStatus | null>;
    getRecommendations(id: string): Promise<ProjectRecommendationsResult | null>;
    update(id: string, updateProjectDto: UpdateProjectDto, actorId?: string): Promise<any>;
    assignSupervisor(id: string, supervisorId: string, actorId?: string): Promise<any>;
    updateStatus(id: string, status: ProjectStatus, actorId?: string): Promise<any>;
    updateType(id: string, type: ProjectType, actorId?: string): Promise<any>;
    remove(id: string, actorId?: string): Promise<any>;
}
