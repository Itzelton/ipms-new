import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRepository } from './repositories/ai.repository';
import { AiAssistantService } from './ai-assistant.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository, AiAssistantService],
  exports: [AiService],
})
export class AiModule {}

