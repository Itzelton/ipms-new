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
exports.SubmissionsService = void 0;
const common_1 = require("@nestjs/common");
const submission_repository_1 = require("./repositories/submission.repository");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const discussions_service_1 = require("../discussions/discussions.service");
let SubmissionsService = class SubmissionsService {
    submissionRepository;
    auditService;
    notificationsService;
    discussionsService;
    constructor(submissionRepository, auditService, notificationsService, discussionsService) {
        this.submissionRepository = submissionRepository;
        this.auditService = auditService;
        this.notificationsService = notificationsService;
        this.discussionsService = discussionsService;
    }
    async create(createSubmissionDto, authorId) {
        const submission = await this.submissionRepository.create(createSubmissionDto, authorId);
        await this.auditService.log(authorId || null, 'create_submission', 'Submission', submission.id, { projectId: submission.projectId });
        if (submission.projectId) {
            const project = await this.submissionRepository.prisma.project.findUnique({ where: { id: submission.projectId }, select: { supervisorId: true } });
            if (project?.supervisorId) {
                await this.notificationsService.create({
                    recipientId: project.supervisorId,
                    message: `New submission created for project ${submission.projectId}`,
                    link: `/submissions/${submission.id}`,
                });
            }
        }
        const thread = await this.discussionsService.createThread({
            projectId: submission.projectId,
            submissionId: submission.id,
            title: `Submission discussion for ${submission.id}`,
            createdById: authorId,
        });
        await this.discussionsService.createMessage(thread.id, {
            content: `Submission created: ${createSubmissionDto.content}`,
            authorId,
        });
        return submission;
    }
    async findAll(pagination) {
        return this.submissionRepository.findAll(pagination);
    }
    async findOne(id) {
        return this.submissionRepository.findOne(id);
    }
    async update(id, updateSubmissionDto, actorId) {
        const res = await this.submissionRepository.update(id, updateSubmissionDto);
        await this.auditService.log(actorId || null, 'update_submission', 'Submission', id, updateSubmissionDto);
        return res;
    }
    async remove(id, actorId) {
        const res = await this.submissionRepository.remove(id);
        await this.auditService.log(actorId || null, 'delete_submission', 'Submission', id, {});
        return res;
    }
    async createVersion(submissionId, authorId, dto) {
        const version = await this.submissionRepository.createVersion(submissionId, authorId, dto);
        await this.auditService.log(authorId || null, 'create_submission_version', 'SubmissionVersion', version.id, { submissionId, versionNumber: version.versionNumber });
        return version;
    }
    async listVersions(submissionId) {
        return this.submissionRepository.listVersions(submissionId);
    }
    async getVersion(submissionId, versionNumber) {
        return this.submissionRepository.getVersionByNumber(submissionId, versionNumber);
    }
    async revertToVersion(submissionId, versionId, userId) {
        const version = await this.submissionRepository.revertToVersion(submissionId, versionId, userId);
        await this.auditService.log(userId || null, 'revert_submission_version', 'SubmissionVersion', version.id, { submissionId, revertedFrom: versionId });
        return version;
    }
};
exports.SubmissionsService = SubmissionsService;
exports.SubmissionsService = SubmissionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [submission_repository_1.SubmissionRepository,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        discussions_service_1.DiscussionsService])
], SubmissionsService);
