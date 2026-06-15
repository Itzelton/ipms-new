import { PrismaService } from '../../common/prisma/prisma.service';
export type SupervisorPerformanceReportRow = {
    supervisorId: string;
    supervisorName: string;
    supervisedProjectCount: number;
    submissionCount: number;
    averageGrade?: number;
    avgHealthScore?: number;
    riskSignalsCount: number;
};
export declare class SupervisorPerformanceGenerator {
    private readonly prisma;
    constructor(prisma: PrismaService);
    generate(params: {
        scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
        projectId?: string;
        supervisorId?: string;
        cohortId?: string;
        departmentId?: string;
        dateRange?: string;
    }): Promise<{
        title: string;
        rows: SupervisorPerformanceReportRow[];
    }>;
    private buildRow;
}
