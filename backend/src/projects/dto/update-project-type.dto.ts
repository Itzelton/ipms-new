import { IsNotEmpty } from 'class-validator';
import { ProjectType } from '@prisma/client';

export class UpdateProjectTypeDto {
  @IsNotEmpty()
  type: ProjectType;
}

