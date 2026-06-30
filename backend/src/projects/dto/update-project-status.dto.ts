import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
  @IsNotEmpty()
  status: ProjectStatus;
}
