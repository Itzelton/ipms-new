import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRequestDto } from './dto/ai-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChatAssistantRequestDto } from './dto/chat-assistant-request.dto';
import { AiAssistantService } from './ai-assistant.service';
import { ForecastHorizon } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiAssistantService: AiAssistantService,
  ) {}

  @Post('health-score')
  healthScore(@Body() dto: AiRequestDto) {
    return this.aiService.healthScore(dto);
  }

  @Post('risk-detection')
  riskDetection(@Body() dto: AiRequestDto) {
    return this.aiService.riskDetection(dto);
  }

  @Post('recommendations')
  recommendations(@Body() dto: AiRequestDto) {
    return this.aiService.recommendations(dto);
  }

  @Get('forecast/:projectId')
  forecast(@Param('projectId') projectId: string, @Query('horizon') horizon?: ForecastHorizon) {
    return this.aiService.forecast(projectId, horizon);
  }

  @Post('assistant/chat')
  chatAssistant(@Body() dto: ChatAssistantRequestDto) {
    return this.aiAssistantService.chat(dto);
  }
}

