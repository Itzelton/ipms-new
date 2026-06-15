import { ReportRepository } from './repositories/report.repository';
import { CreateReportDto } from './dto/create-report.dto';
export declare class ReportsService {
    private readonly reportRepository;
    constructor(reportRepository: ReportRepository);
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
    create(createReportDto: CreateReportDto): Promise<{
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
