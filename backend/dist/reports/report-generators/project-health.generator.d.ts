import { PrismaService } from '../../common/prisma/prisma.service';
export type ProjectHealthReportRow = {
    projectId: string;
    projectTitle: string;
    status: string;
    healthScore?: number;
    riskCounts: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    submissionCount: number;
    milestoneCompletionRatio: number;
    recommendationsCount: number;
};
export declare class ProjectHealthGenerator {
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
        rows: ProjectHealthReportRow[];
    }>;
}
