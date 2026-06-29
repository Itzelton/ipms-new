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
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const client_1 = require("@prisma/client");
let ProjectRepository = class ProjectRepository {
    prisma;
    useInMemoryData = !process.env.DATABASE_URL;
    mockProjects = [
        {
            id: (0, crypto_1.randomUUID)(),
            title: 'Project Alpha',
            description: 'A capstone project focused on a real-world problem.',
            status: client_1.ProjectStatus.ACTIVE,
            type: client_1.ProjectType.CAPSTONE,
            student: {
                id: (0, crypto_1.randomUUID)(),
                email: 'student@example.com',
                firstName: 'Student',
                lastName: 'Example',
            },
            supervisor: {
                id: (0, crypto_1.randomUUID)(),
                email: 'supervisor@example.com',
                firstName: 'Supervisor',
                lastName: 'Example',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: (0, crypto_1.randomUUID)(),
            title: 'Research Insight',
            description: 'A research-oriented project that explores a new approach.',
            status: client_1.ProjectStatus.PROPOSED,
            type: client_1.ProjectType.RESEARCH,
            student: {
                id: (0, crypto_1.randomUUID)(),
                email: 'researcher@example.com',
                firstName: 'Researcher',
                lastName: 'Example',
            },
            supervisor: {
                id: (0, crypto_1.randomUUID)(),
                email: 'advisor@example.com',
                firstName: 'Advisor',
                lastName: 'Example',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        if (this.useInMemoryData) {
            const project = {
                id: (0, crypto_1.randomUUID)(),
                ...data,
                status: data.status || client_1.ProjectStatus.PROPOSED,
                type: data.type || client_1.ProjectType.OTHER,
                student: null,
                supervisor: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            this.mockProjects.push(project);
            return project;
        }
        return this.prisma.project.create({ data });
    }
    async findAll(pagination) {
        if (this.useInMemoryData) {
            const take = pagination.limit || 20;
            const skip = pagination.page ? (pagination.page - 1) * take : 0;
            return this.mockProjects.slice(skip, skip + take);
        }
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
        if (this.useInMemoryData) {
            return this.mockProjects.find((project) => project.id === id);
        }
        return this.prisma.project.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, email: true, firstName: true, lastName: true } },
                supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
        });
    }
    async findDetails(id) {
        if (this.useInMemoryData) {
            const project = this.mockProjects.find((item) => item.id === id);
            if (!project) {
                return null;
            }
            return {
                ...project,
                department: null,
                cohort: null,
                assignments: [],
                milestones: [],
                submissions: [],
                discussionThreads: [],
                notifications: [],
                analytics: [],
                healthScores: [],
                riskSignals: [],
                recommendations: [],
                forecasts: [],
                reports: [],
            };
        }
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
        if (this.useInMemoryData) {
            return 0;
        }
        return this.prisma.discussionMessage.count({
            where: {
                thread: {
                    projectId,
                },
            },
        });
    }
    async countDiscussionMessagesByAuthor(projectId, authorId) {
        if (this.useInMemoryData) {
            return 0;
        }
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
        if (this.useInMemoryData) {
            const project = this.mockProjects.find((item) => item.id === id);
            if (!project) {
                return null;
            }
            Object.assign(project, data, { updatedAt: new Date() });
            return project;
        }
        return this.prisma.project.update({ where: { id }, data });
    }
    async assignSupervisor(id, supervisorId) {
        if (this.useInMemoryData) {
            const project = this.mockProjects.find((item) => item.id === id);
            if (!project) {
                return null;
            }
            project.supervisor = {
                id: supervisorId,
                email: `supervisor+${supervisorId}@example.com`,
                firstName: 'Supervisor',
                lastName: 'Assigned',
            };
            return project;
        }
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
        if (this.useInMemoryData) {
            const project = this.mockProjects.find((item) => item.id === id);
            if (!project) {
                return null;
            }
            project.status = status;
            project.updatedAt = new Date();
            return project;
        }
        return this.prisma.project.update({ where: { id }, data: { status } });
    }
    async updateType(id, type) {
        if (this.useInMemoryData) {
            const project = this.mockProjects.find((item) => item.id === id);
            if (!project) {
                return null;
            }
            project.type = type;
            project.updatedAt = new Date();
            return project;
        }
        return this.prisma.project.update({ where: { id }, data: { type } });
    }
    async remove(id) {
        if (this.useInMemoryData) {
            const index = this.mockProjects.findIndex((item) => item.id === id);
            if (index === -1) {
                return null;
            }
            const [removed] = this.mockProjects.splice(index, 1);
            return removed;
        }
        return this.prisma.project.delete({ where: { id } });
    }
};
exports.ProjectRepository = ProjectRepository;
exports.ProjectRepository = ProjectRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectRepository);
