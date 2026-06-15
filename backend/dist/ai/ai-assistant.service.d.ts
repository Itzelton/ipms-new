import { PrismaService } from '../common/prisma/prisma.service';
import { ChatAssistantRequestDto } from './dto/chat-assistant-request.dto';
import { ChatAssistantResponseDto } from './dto/chat-assistant-response.dto';
export declare class AiAssistantService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    chat(dto: ChatAssistantRequestDto): Promise<ChatAssistantResponseDto>;
    private classifyIntent;
}
