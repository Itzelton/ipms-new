"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_request_dto_1 = require("./dto/ai-request.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const chat_assistant_request_dto_1 = require("./dto/chat-assistant-request.dto");
const ai_assistant_service_1 = require("./ai-assistant.service");
let AiController = class AiController {
    aiService;
    aiAssistantService;
    constructor(aiService, aiAssistantService) {
        this.aiService = aiService;
        this.aiAssistantService = aiAssistantService;
    }
    healthScore(dto) {
        return this.aiService.healthScore(dto);
    }
    riskDetection(dto) {
        return this.aiService.riskDetection(dto);
    }
    recommendations(dto) {
        return this.aiService.recommendations(dto);
    }
    forecast(projectId, horizon) {
        return this.aiService.forecast(projectId, horizon);
    }
    chatAssistant(dto) {
        return this.aiAssistantService.chat(dto);
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('health-score'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_request_dto_1.AiRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "healthScore", null);
__decorate([
    (0, common_1.Post)('risk-detection'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_request_dto_1.AiRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "riskDetection", null);
__decorate([
    (0, common_1.Post)('recommendations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_request_dto_1.AiRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "recommendations", null);
__decorate([
    (0, common_1.Get)('forecast/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('horizon')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "forecast", null);
__decorate([
    (0, common_1.Post)('assistant/chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_assistant_request_dto_1.ChatAssistantRequestDto]),
    __metadata("design:returntype", void 0)
], AiController.prototype, "chatAssistant", null);
exports.AiController = AiController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        ai_assistant_service_1.AiAssistantService])
], AiController);
