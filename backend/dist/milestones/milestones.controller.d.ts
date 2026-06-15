import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class MilestonesController {
    private readonly milestonesService;
    constructor(milestonesService: MilestonesService);
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
    create(createMilestoneDto: CreateMilestoneDto): Promise<{
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
    update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
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
