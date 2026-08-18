import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { MeetingStatus } from '@prisma/client';

export class UpdateMeetingDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() agenda?: string;
  @IsOptional() @IsEnum(MeetingStatus) status?: MeetingStatus;
  @IsOptional() @IsString() outcome?: string;
}
