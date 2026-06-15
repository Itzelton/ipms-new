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
        projectId: string | null;
        title: string;
        status: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        generatedById: string;
        supervisorId: string | null;
        completedAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        projectId: string | null;
        title: string;
        status: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        generatedById: string;
        supervisorId: string | null;
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
        projectId: string | null;
        title: string;
        status: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        generatedById: string;
        supervisorId: string | null;
        completedAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        departmentId: string | null;
        cohortId: string | null;
        description: string | null;
        projectId: string | null;
        title: string;
        status: string;
        scope: import(".prisma/client").$Enums.ReportScope;
        generatedById: string;
        supervisorId: string | null;
        completedAt: Date | null;
    }>;
}
