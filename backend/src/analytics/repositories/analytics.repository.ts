import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AnalyticsQueryDto } from '../dto/analytics-query.dto';

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: AnalyticsQueryDto) {
    return this.prisma.analyticsSnapshot.findMany({
      where: {
        projectId: query.projectId,
      },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async projectMetrics(projectId: string, query: AnalyticsQueryDto) {
    return this.prisma.analyticsSnapshot.findMany({
      where: {
        projectId,
      },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }
}
