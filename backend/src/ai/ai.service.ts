import { Injectable } from '@nestjs/common';
import { AiRepository } from './repositories/ai.repository';
import { AiRequestDto } from './dto/ai-request.dto';
import { ForecastHorizon } from '@prisma/client';

@Injectable()
export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async healthScore(dto: AiRequestDto) {
    return this.aiRepository.generateHealthScore(dto);
  }

  async riskDetection(dto: AiRequestDto) {
    return this.aiRepository.detectRisk(dto);
  }

  async recommendations(dto: AiRequestDto) {
    return this.aiRepository.generateRecommendation(dto);
  }

  async forecast(projectId: string, horizon?: ForecastHorizon) {
    return this.aiRepository.generateForecast(projectId, horizon);
  }
}
