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
exports.AiRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let AiRepository = class AiRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateHealthScore(dto) {
        return this.prisma.aIHealthScore.create({
            data: {
                projectId: dto.projectId,
                score: 0,
                source: 'placeholder',
            },
        });
    }
    async detectRisk(dto) {
        return this.prisma.aIRiskSignal.create({
            data: {
                projectId: dto.projectId,
                severity: client_1.RiskSeverity.LOW,
                description: dto.prompt,
            },
        });
    }
    async generateRecommendation(dto) {
        return this.prisma.aIRecommendation.create({
            data: {
                projectId: dto.projectId,
                recommendation: dto.prompt,
            },
        });
    }
    async generateForecast(projectId, horizon) {
        return this.prisma.forecast.create({
            data: {
                projectId,
                horizon: horizon || client_1.ForecastHorizon.SHORT_TERM,
                summary: 'Forecast placeholder',
            },
        });
    }
};
exports.AiRepository = AiRepository;
exports.AiRepository = AiRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiRepository);
