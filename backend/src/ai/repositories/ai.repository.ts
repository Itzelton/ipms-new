import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiRequestDto } from '../dto/ai-request.dto';

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
        severity: 'low',
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

  async generateForecast(projectId: string, horizon?: string) {
    return this.prisma.forecast.create({
      data: {
        projectId,
        horizon: horizon || 'standard',
        summary: 'Forecast placeholder',
      },
    });
  }
}
