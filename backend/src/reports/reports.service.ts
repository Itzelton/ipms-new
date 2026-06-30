import { Injectable } from '@nestjs/common';
import { ReportRepository } from './repositories/report.repository';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async findAll(scope?: string) {
    return this.reportRepository.findAll(scope);
  }

  async findOne(id: string) {
    return this.reportRepository.findOne(id);
  }

  async create(createReportDto: CreateReportDto) {
    return this.reportRepository.create(createReportDto);
  }

  async remove(id: string) {
    return this.reportRepository.remove(id);
  }
}
