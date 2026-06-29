import { PrismaService } from '../../common/prisma/prisma.service';
export declare class ReportRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(scope?: string): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        title: string;
        status: string;
        supervisorId: string | null;
        projectId: string | null;
        generatedById: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        completedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        title: string;
        status: string;
        supervisorId: string | null;
        projectId: string | null;
        generatedById: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        completedAt: Date | null;
    } | null>;
    create(data: {
        title: string;
        description?: string;
        generatedById: string;
        scope?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        title: string;
        status: string;
        supervisorId: string | null;
        projectId: string | null;
        generatedById: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        completedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        title: string;
        status: string;
        supervisorId: string | null;
        projectId: string | null;
        generatedById: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        completedAt: Date | null;
    }>;
}
