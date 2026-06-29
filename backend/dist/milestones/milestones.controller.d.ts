import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class MilestonesController {
    private readonly milestonesService;
    constructor(milestonesService: MilestonesService);
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
    create(createMilestoneDto: CreateMilestoneDto): Promise<{
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
    update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
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
