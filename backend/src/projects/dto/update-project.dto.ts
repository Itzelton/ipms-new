import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ProjectStatus, ProjectType } from '@prisma/client';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  cohortId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  expectedEndDate?: string;

  @IsOptional()
  @IsDateString()
  actualEndDate?: string;

  @IsOptional()
  status?: ProjectStatus;

  @IsOptional()
  type?: ProjectType;
}
