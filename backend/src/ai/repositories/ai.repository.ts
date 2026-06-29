import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiRequestDto } from '../dto/ai-request.dto';
import { RiskSeverity, ForecastHorizon } from '@prisma/client';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async generateHealthScore(dto: AiRequestDto) {
    return this.prisma.aIHealthScore.create({
      data: {
        projectId: dto.projectId,
        score: 0,
        source: 'placeholder',
      },
    });
  }

  async detectRisk(dto: AiRequestDto) {
    return this.prisma.aIRiskSignal.create({
      data: {
        projectId: dto.projectId,
        severity: RiskSeverity.LOW,
        description: dto.prompt,
      },
    });
  }

  async generateRecommendation(dto: AiRequestDto) {
    return this.prisma.aIRecommendation.create({
      data: {
        projectId: dto.projectId,
        recommendation: dto.prompt,
      },
    });
  }

  async generateForecast(projectId: string, horizon?: ForecastHorizon) {
    return this.prisma.forecast.create({
      data: {
        projectId,
        horizon: horizon || ForecastHorizon.SHORT_TERM,
        summary: 'Forecast placeholder',
      },
    });
  }
}
