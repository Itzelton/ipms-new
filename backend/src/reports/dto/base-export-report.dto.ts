import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export type ReportExportScope = 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';

export class BaseExportReportDto {
  @IsIn(['PROJECT', 'SUPERVISOR', 'COHORT', 'DEPARTMENT', 'ADMIN'])
  scope!: ReportExportScope;

  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @IsOptional()
  @IsUUID()
  cohortId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  dateRange?: string;
}

