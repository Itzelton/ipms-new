import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString() studentId: string;
  @IsString() title: string;
  @IsDateString() scheduledAt: string;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() agenda?: string;
}
