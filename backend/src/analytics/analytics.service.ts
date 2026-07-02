import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { HeatmapQueryDto } from './dto/heatmap-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async findAll(query: AnalyticsQueryDto) {
    return this.analyticsRepository.findAll(query);
  }

  async projectMetrics(projectId: string, query: AnalyticsQueryDto) {
    return this.analyticsRepository.projectMetrics(projectId, query);
  }

  async userHeatmap(userId: string, query: HeatmapQueryDto) {
    const year = query.year ?? new Date().getFullYear();
    return { year, days: await this.analyticsRepository.userHeatmap(userId, year) };
  }

  async projectHeatmap(projectId: string, query: HeatmapQueryDto) {
    const year = query.year ?? new Date().getFullYear();
    return { year, days: await this.analyticsRepository.projectHeatmap(projectId, year) };
  }
}
