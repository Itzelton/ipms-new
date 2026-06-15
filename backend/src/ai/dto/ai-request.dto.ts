import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class AiRequestDto {
  @IsUUID()
  projectId: string;

  @IsNotEmpty()
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  context?: string;
}
