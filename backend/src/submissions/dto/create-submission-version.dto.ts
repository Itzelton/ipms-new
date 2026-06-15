import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EvidenceType } from './create-submission.dto';

export class CreateSubmissionVersionDto {
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
}
