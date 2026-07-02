import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RoleName } from '@prisma/client';

export class AddCollaboratorDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;
}
