export type ReportExportScope = 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
export declare class BaseExportReportDto {
    scope: ReportExportScope;
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
}
