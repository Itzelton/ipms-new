import { IsIn, IsOptional, IsString } from 'class-validator';

export class ExportReportFormatDto {
  @IsIn(['pdf', 'excel'])
  format!: 'pdf' | 'excel';

  @IsOptional()
  @IsString()
  filename?: string;
}

