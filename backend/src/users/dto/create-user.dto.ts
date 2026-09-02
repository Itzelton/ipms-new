import { RoleName } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsEnum(RoleName)
  role!: RoleName;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  // Student-only
  @IsOptional()
  @IsString()
  @Length(8, 8)
  indexNumber?: string;

  @IsOptional()
  @IsString()
  level?: string;

  // Supervisor-only
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  // Internal use only — do not expose in API docs
  @IsOptional()
  @IsString()
  password?: string;
}
