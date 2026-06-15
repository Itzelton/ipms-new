import { PrismaService } from '../../common/prisma/prisma.service';
export type StudentProgressReportRow = {
    studentId: string;
    studentName: string;
    projectId: string;
    projectTitle: string;
    submissionCount: number;
    submittedMilestones: number;
    totalMilestones: number;
    completionRatio: number;
    averageGrade?: number;
};
export declare class StudentProgressGenerator {
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
        rows: StudentProgressReportRow[];
    }>;
}
