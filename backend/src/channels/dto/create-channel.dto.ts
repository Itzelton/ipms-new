import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsEnum(ChannelType)
  type: ChannelType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  projectId?: string;
}
