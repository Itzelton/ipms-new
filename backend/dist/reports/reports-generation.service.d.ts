import { PrismaService } from '../common/prisma/prisma.service';
export declare class ReportsGenerationService {
    private readonly prisma;
    private readonly studentProgressGenerator;
    private readonly projectHealthGenerator;
    private readonly supervisorPerformanceGenerator;
    private readonly excelExporter;
    private readonly pdfExporter;
    constructor(prisma: PrismaService);
    exportStudentProgress(params: {
        scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
        dateRange?: string;
        projectId?: string;
        supervisorId?: string;
        cohortId?: string;
        departmentId?: string;
        format: 'pdf' | 'excel';
        filename?: string;
    }): Promise<{
        buffer: Buffer;
        filename: string;
        mimeType: string;
    }>;
    exportProjectHealth(params: {
        scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
        projectId?: string;
        supervisorId?: string;
        cohortId?: string;
        departmentId?: string;
        dateRange?: string;
        format: 'pdf' | 'excel';
        filename?: string;
    }): Promise<{
        buffer: Buffer;
        filename: string;
        mimeType: string;
    }>;
    exportSupervisorPerformance(params: {
        scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
        projectId?: string;
        supervisorId?: string;
        cohortId?: string;
        departmentId?: string;
        dateRange?: string;
        format: 'pdf' | 'excel';
        filename?: string;
    }): Promise<{
        buffer: Buffer;
        filename: string;
        mimeType: string;
    }>;
    private exportTabularOrJson;
}
