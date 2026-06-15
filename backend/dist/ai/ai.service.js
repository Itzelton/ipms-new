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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const ai_repository_1 = require("./repositories/ai.repository");
let AiService = class AiService {
    aiRepository;
    constructor(aiRepository) {
        this.aiRepository = aiRepository;
    }
    async healthScore(dto) {
        return this.aiRepository.generateHealthScore(dto);
    }
    async riskDetection(dto) {
        return this.aiRepository.detectRisk(dto);
    }
    async recommendations(dto) {
        return this.aiRepository.generateRecommendation(dto);
    }
    async forecast(projectId, horizon) {
        return this.aiRepository.generateForecast(projectId, horizon);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_repository_1.AiRepository])
], AiService);
