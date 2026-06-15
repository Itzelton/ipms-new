import { ProjectStatus, ProjectType } from '@prisma/client';
export declare class CreateProjectDto {
    title: string;
    description?: string;
    studentId?: string;
    supervisorId?: string;
    departmentId?: string;
    cohortId?: string;
    startDate?: string;
    expectedEndDate?: string;
    status?: ProjectStatus;
    type?: ProjectType;
}
