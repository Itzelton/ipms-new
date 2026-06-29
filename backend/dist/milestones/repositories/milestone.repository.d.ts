import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class MilestoneRepository {
    readonly prisma: PrismaService;
    constructor(prisma: PrismaService);
    create(data: CreateMilestoneDto): Promise<{
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
    update(id: string, data: UpdateMilestoneDto): Promise<{
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
    remove(id: string): Promise<{
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
