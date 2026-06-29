import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignSupervisorDto } from './dto/assign-supervisor.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(pagination: PaginationDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findDetails(id: string): Promise<any>;
    findHealth(id: string): Promise<import("./project-health.service").ProjectHealthScoreResult | null>;
    findRisk(id: string): Promise<import("./project-health.service").ProjectRiskStatus | null>;
    findRecommendations(id: string): Promise<import("./project-health.service").ProjectRecommendationsResult | null>;
    create(createProjectDto: CreateProjectDto): Promise<any>;
    update(id: string, updateProjectDto: UpdateProjectDto): Promise<any>;
    assignSupervisor(id: string, dto: AssignSupervisorDto): Promise<any>;
    updateStatus(id: string, dto: UpdateProjectStatusDto): Promise<any>;
    updateType(id: string, dto: UpdateProjectTypeDto): Promise<any>;
    remove(id: string): Promise<any>;
}
