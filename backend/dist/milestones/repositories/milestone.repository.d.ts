import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class MilestoneRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateMilestoneDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        completedAt: Date | null;
        dueDate: Date;
    }>;
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        completedAt: Date | null;
        dueDate: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        completedAt: Date | null;
        dueDate: Date;
    } | null>;
    update(id: string, data: UpdateMilestoneDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        completedAt: Date | null;
        dueDate: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
        title: string;
        status: import(".prisma/client").$Enums.MilestoneStatus;
        completedAt: Date | null;
        dueDate: Date;
    }>;
}
