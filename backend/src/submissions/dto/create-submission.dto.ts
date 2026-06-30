import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum EvidenceType {
  DOCUMENT = 'DOCUMENT',
  GITHUB = 'GITHUB',
  WEBSITE = 'WEBSITE',
  APK = 'APK',
  SCREENSHOT = 'SCREENSHOT',
  DEMO_VIDEO = 'DEMO_VIDEO',
  MEETING_RECORD = 'MEETING_RECORD',
}

export class CreateSubmissionDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  milestoneId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsString()
  status?: string;
}
