import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProjectStatus, ProjectType } from '@prisma/client';
export declare class ProjectRepository {
    private readonly prisma;
    private readonly useInMemoryData;
    private readonly mockProjects;
    constructor(prisma: PrismaService);
    create(data: CreateProjectDto): Promise<any>;
    findAll(pagination: PaginationDto): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findDetails(id: string): Promise<any>;
    countDiscussionMessages(projectId: string): Promise<number>;
    countDiscussionMessagesByAuthor(projectId: string, authorId: string): Promise<number>;
    update(id: string, data: UpdateProjectDto): Promise<any>;
    assignSupervisor(id: string, supervisorId: string): Promise<any>;
    updateStatus(id: string, status: ProjectStatus): Promise<any>;
    updateType(id: string, type: ProjectType): Promise<any>;
    remove(id: string): Promise<any>;
}
