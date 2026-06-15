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
exports.DiscussionsService = void 0;
const common_1 = require("@nestjs/common");
const discussion_repository_1 = require("./repositories/discussion.repository");
const notifications_service_1 = require("../notifications/notifications.service");
let DiscussionsService = class DiscussionsService {
    discussionRepository;
    notificationsService;
    constructor(discussionRepository, notificationsService) {
        this.discussionRepository = discussionRepository;
        this.notificationsService = notificationsService;
    }
    async findAll(pagination) {
        return this.discussionRepository.findAll(pagination);
    }
    async findOne(id) {
        return this.discussionRepository.findOne(id);
    }
    async findBySubmission(submissionId) {
        return this.discussionRepository.findBySubmission(submissionId);
    }
    async createThread(dto) {
        return this.discussionRepository.createThread(dto);
    }
    async createMessage(threadId, dto) {
        const thread = await this.discussionRepository.findOne(threadId);
        const message = await this.discussionRepository.createMessage(threadId, dto);
        const mentionKeys = Array.from(new Set((dto.content.match(/@([\w.-]+)/g) || []).map((match) => match.slice(1))));
        const mentionedUsers = await this.discussionRepository.findUsersByMentionKeys(mentionKeys);
        const recipientIds = new Set();
        if (thread?.createdById && thread.createdById !== dto.authorId) {
            recipientIds.add(thread.createdById);
        }
        if (thread?.submission?.authorId && thread.submission.authorId !== dto.authorId) {
            recipientIds.add(thread.submission.authorId);
        }
        for (const user of mentionedUsers) {
            if (user.id !== dto.authorId) {
                recipientIds.add(user.id);
            }
        }
        for (const recipientId of recipientIds) {
            await this.notificationsService.create({
                recipientId,
                message: `New discussion reply in thread ${thread?.title || threadId}`,
                link: `/discussions/${threadId}`,
            });
        }
        return message;
    }
    async updateThread(id, dto) {
        return this.discussionRepository.updateThread(id, dto);
    }
    async remove(id) {
        return this.discussionRepository.remove(id);
    }
};
exports.DiscussionsService = DiscussionsService;
exports.DiscussionsService = DiscussionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [discussion_repository_1.DiscussionRepository,
        notifications_service_1.NotificationsService])
], DiscussionsService);
