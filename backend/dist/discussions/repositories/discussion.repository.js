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
exports.DiscussionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let DiscussionRepository = class DiscussionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(pagination) {
        const take = pagination.limit || 20;
        const skip = pagination.page ? (pagination.page - 1) * take : 0;
        return this.prisma.discussionThread.findMany({ skip, take });
    }
    async findOne(id) {
        return this.prisma.discussionThread.findUnique({
            where: { id },
            include: {
                project: true,
                submission: { include: { author: true } },
                messages: {
                    include: {
                        author: true,
                        replies: {
                            include: { author: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    async createThread(data) {
        return this.prisma.discussionThread.create({ data });
    }
    async findBySubmission(submissionId) {
        return this.prisma.discussionThread.findFirst({
            where: { submissionId },
            include: {
                project: true,
                submission: true,
                messages: {
                    include: {
                        author: true,
                        replies: {
                            include: { author: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
    }
    async createMessage(threadId, data) {
        return this.prisma.discussionMessage.create({
            data: { ...data, threadId },
        });
    }
    async findUsersByMentionKeys(mentionKeys) {
        if (!mentionKeys.length)
            return [];
        const uniqueKeys = Array.from(new Set(mentionKeys.map((key) => key.toLowerCase())));
        return this.prisma.user.findMany({
            where: {
                OR: uniqueKeys.flatMap((key) => [
                    { email: { contains: key, mode: 'insensitive' } },
                    { firstName: { contains: key, mode: 'insensitive' } },
                    { lastName: { contains: key, mode: 'insensitive' } },
                    { preferredName: { contains: key, mode: 'insensitive' } },
                ]),
            },
            take: 10,
        });
    }
    async updateThread(id, data) {
        return this.prisma.discussionThread.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.discussionThread.delete({ where: { id } });
    }
};
exports.DiscussionRepository = DiscussionRepository;
exports.DiscussionRepository = DiscussionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscussionRepository);
