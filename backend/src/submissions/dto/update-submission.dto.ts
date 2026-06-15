import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EvidenceType } from './create-submission.dto';

export class UpdateSubmissionDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(EvidenceType)
  evidenceType?: EvidenceType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  metadata?: any;
}
