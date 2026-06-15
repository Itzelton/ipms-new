import { ProjectStatus, ProjectType } from '@prisma/client';
export declare class UpdateProjectDto {
    title?: string;
    description?: string;
    studentId?: string;
    supervisorId?: string;
    departmentId?: string;
    cohortId?: string;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    status?: ProjectStatus;
    type?: ProjectType;
}
