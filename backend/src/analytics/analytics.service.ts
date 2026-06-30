import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async findAll(query: AnalyticsQueryDto) {
    return this.analyticsRepository.findAll(query);
  }

  async projectMetrics(projectId: string, query: AnalyticsQueryDto) {
    return this.analyticsRepository.projectMetrics(projectId, query);
  }
}
