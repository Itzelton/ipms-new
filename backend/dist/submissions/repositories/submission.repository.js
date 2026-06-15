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
exports.SubmissionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let SubmissionRepository = class SubmissionRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data, authorId) {
        return this.prisma.$transaction(async (prisma) => {
            const submission = await prisma.submission.create({
                data: {
                    projectId: data.projectId,
                    milestoneId: data.milestoneId,
                    authorId,
                    content: data.content,
                    evidenceType: data.evidenceType,
                    fileUrl: data.fileUrl,
                    metadata: data.metadata,
                    status: data.status || 'DRAFT',
                },
            });
            await prisma.submissionVersion.create({
                data: {
                    submissionId: submission.id,
                    versionNumber: 1,
                    content: data.content,
                    evidenceType: data.evidenceType,
                    fileUrl: data.fileUrl,
                    authorId,
                    metadata: data.metadata,
                },
            });
            return submission;
        });
    }
    async findAll(pagination) {
        const take = pagination.limit || 20;
        const skip = pagination.page ? (pagination.page - 1) * take : 0;
        return this.prisma.submission.findMany({
            skip,
            take,
            include: { author: true, project: true },
        });
    }
    async findOne(id) {
        return this.prisma.submission.findUnique({ where: { id }, include: { author: true, project: true } });
    }
    async update(id, data) {
        return this.prisma.submission.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.submission.delete({ where: { id } });
    }
    async createVersion(submissionId, authorId, dto) {
        return this.prisma.$transaction(async (prisma) => {
            const last = await prisma.submissionVersion.findFirst({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });
            const nextVersion = last ? last.versionNumber + 1 : 1;
            const version = await prisma.submissionVersion.create({
                data: {
                    submissionId,
                    versionNumber: nextVersion,
                    content: dto.content,
                    evidenceType: dto.evidenceType,
                    fileUrl: dto.fileUrl,
                    authorId,
                    metadata: dto.metadata,
                },
            });
            await prisma.submission.update({ where: { id: submissionId }, data: { content: dto.content, evidenceType: dto.evidenceType, fileUrl: dto.fileUrl } });
            return version;
        });
    }
    async listVersions(submissionId) {
        return this.prisma.submissionVersion.findMany({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });
    }
    async getVersionByNumber(submissionId, versionNumber) {
        return this.prisma.submissionVersion.findFirst({ where: { submissionId, versionNumber } });
    }
    async getVersionById(versionId) {
        return this.prisma.submissionVersion.findUnique({ where: { id: versionId } });
    }
    async revertToVersion(submissionId, versionId, userId) {
        return this.prisma.$transaction(async (prisma) => {
            const version = await prisma.submissionVersion.findUnique({ where: { id: versionId } });
            if (!version || version.submissionId !== submissionId) {
                throw new Error('Version not found for submission');
            }
            const last = await prisma.submissionVersion.findFirst({ where: { submissionId }, orderBy: { versionNumber: 'desc' } });
            const nextVersion = last ? last.versionNumber + 1 : 1;
            const newVersion = await prisma.submissionVersion.create({
                data: {
                    submissionId,
                    versionNumber: nextVersion,
                    content: version.content,
                    fileUrl: version.fileUrl,
                    authorId: userId,
                    metadata: { revertedFrom: versionId },
                },
            });
            await prisma.submission.update({ where: { id: submissionId }, data: { content: newVersion.content, fileUrl: newVersion.fileUrl } });
            return newVersion;
        });
    }
};
exports.SubmissionRepository = SubmissionRepository;
exports.SubmissionRepository = SubmissionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubmissionRepository);
