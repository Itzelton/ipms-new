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
exports.ProjectRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectRepository = class ProjectRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.project.create({ data });
    }
    async findAll(pagination) {
        const take = pagination.limit || 20;
        const skip = pagination.page ? (pagination.page - 1) * take : 0;
        return this.prisma.project.findMany({
            skip,
            take,
            include: {
                student: { select: { id: true, email: true, firstName: true, lastName: true } },
                supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });
    }
    async findOne(id) {
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, email: true, firstName: true, lastName: true } },
                supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });
    }
    async findDetails(id) {
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                student: true,
                supervisor: true,
                department: true,
                cohort: true,
                assignments: {
                    include: { user: true },
                },
                milestones: true,
                submissions: true,
                discussionThreads: true,
                notifications: true,
                analytics: true,
                healthScores: true,
                riskSignals: true,
                recommendations: true,
                forecasts: true,
                reports: true,
            },
        });
    }
    async countDiscussionMessages(projectId) {
        return this.prisma.discussionMessage.count({
            where: {
                thread: {
                    projectId,
                },
            },
        });
    }
    async countDiscussionMessagesByAuthor(projectId, authorId) {
        return this.prisma.discussionMessage.count({
            where: {
                authorId,
                thread: {
                    projectId,
                },
            },
        });
    }
    async update(id, data) {
        return this.prisma.project.update({ where: { id }, data });
    }
    async assignSupervisor(id, supervisorId) {
        return this.prisma.project.update({
            where: { id },
            data: {
                supervisorId,
                assignments: {
                    create: {
                        userId: supervisorId,
                        role: client_1.RoleName.SUPERVISOR,
                    },
                },
            },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.project.update({ where: { id }, data: { status } });
    }
    async updateType(id, type) {
        return this.prisma.project.update({ where: { id }, data: { type } });
    }
    async remove(id) {
        return this.prisma.project.delete({ where: { id } });
    }
};
exports.ProjectRepository = ProjectRepository;
exports.ProjectRepository = ProjectRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectRepository);
