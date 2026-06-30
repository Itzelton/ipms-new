import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  recipientId!: string;

  // Kept optional for compatibility with existing domain services.
  // If omitted, NotificationsService will derive sensible defaults.
  @IsOptional()
  @IsString()
  type?: any;

  @IsOptional()
  @IsString()
  title?: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  link?: string;


  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

