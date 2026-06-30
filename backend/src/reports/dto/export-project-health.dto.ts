import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseExportReportDto } from './base-export-report.dto';
import { ExportReportFormatDto } from './export-report-format.dto';

export class ExportProjectHealthReportDto extends BaseExportReportDto {
  @ValidateNested()
  @Type(() => ExportReportFormatDto)
  format!: ExportReportFormatDto['format'];
}


