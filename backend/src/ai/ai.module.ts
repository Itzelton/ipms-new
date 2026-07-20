import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './repositories/ai.repository';
import { AiAssistantService } from './ai-assistant.service';
import { OpenRouterService } from './openrouter.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository, AiAssistantService, OpenRouterService],
  exports: [AiService],
})
export class AiModule {}
