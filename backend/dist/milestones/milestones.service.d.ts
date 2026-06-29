import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MilestoneRepository } from './repositories/milestone.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
export declare class MilestonesService {
    private readonly milestoneRepository;
    private readonly notificationsService;
    private readonly auditService;
    constructor(milestoneRepository: MilestoneRepository, notificationsService: NotificationsService, auditService: AuditService);
    create(createMilestoneDto: CreateMilestoneDto, actorId?: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        updatedAt: Date;
        description: string | null;
        dueDate: Date;
        completedAt: Date | null;
    }>;
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        updatedAt: Date;
        description: string | null;
        dueDate: Date;
        completedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        updatedAt: Date;
        description: string | null;
        dueDate: Date;
        completedAt: Date | null;
    } | null>;
    update(id: string, updateMilestoneDto: UpdateMilestoneDto, actorId?: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        updatedAt: Date;
        description: string | null;
        dueDate: Date;
        completedAt: Date | null;
    }>;
    remove(id: string, actorId?: string): Promise<{
        id: string;
        title: string;
        createdAt: Date;
        projectId: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        updatedAt: Date;
        description: string | null;
        dueDate: Date;
        completedAt: Date | null;
    }>;
}
