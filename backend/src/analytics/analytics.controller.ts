import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { HeatmapQueryDto } from './dto/heatmap-query.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  findAll(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.findAll(query);
  }

  @Get('heatmap')
  userHeatmap(@Query() query: HeatmapQueryDto, @CurrentUser('id') userId: string) {
    return this.analyticsService.userHeatmap(userId, query);
  }

  @Get('projects/:projectId')
  projectMetrics(@Param('projectId') projectId: string, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.projectMetrics(projectId, query);
  }

  @Get('projects/:projectId/heatmap')
  projectHeatmap(@Param('projectId') projectId: string, @Query() query: HeatmapQueryDto) {
    return this.analyticsService.projectHeatmap(projectId, query);
  }
}
