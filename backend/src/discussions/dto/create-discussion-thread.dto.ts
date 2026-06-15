import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDiscussionThreadDto {
  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  submissionId?: string;

  @IsNotEmpty()
  @IsString()
  title: string;
}
