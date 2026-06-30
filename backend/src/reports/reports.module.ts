import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportRepository } from './repositories/report.repository';
import { ReportsGenerationService } from './reports-generation.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportRepository, ReportsGenerationService],
  exports: [ReportsService, ReportsGenerationService],
})
export class ReportsModule {}
