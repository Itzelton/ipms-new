import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  generatedById: string;

  @IsOptional()
  @IsString()
  scope?: string;
}
