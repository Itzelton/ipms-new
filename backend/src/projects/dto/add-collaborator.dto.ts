import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleName } from '@prisma/client';

export class AddCollaboratorDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;
}
