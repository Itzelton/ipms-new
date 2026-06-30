import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  findAll(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.findAll(query);
  }

  @Get('projects/:projectId')
  projectMetrics(@Param('projectId') projectId: string, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.projectMetrics(projectId, query);
  }
}
