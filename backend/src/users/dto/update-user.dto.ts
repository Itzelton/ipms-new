import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  preferredName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  mustChangePassword?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Student profile
  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  indexNumber?: string;

  // Supervisor profile
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
