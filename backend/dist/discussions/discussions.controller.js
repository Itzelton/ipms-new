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
exports.DiscussionsController = void 0;
const common_1 = require("@nestjs/common");
const discussions_service_1 = require("./discussions.service");
const create_discussion_thread_dto_1 = require("./dto/create-discussion-thread.dto");
const create_discussion_message_dto_1 = require("./dto/create-discussion-message.dto");
const update_discussion_thread_dto_1 = require("./dto/update-discussion-thread.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const user_decorator_1 = require("../common/decorators/user.decorator");
let DiscussionsController = class DiscussionsController {
    discussionsService;
    constructor(discussionsService) {
        this.discussionsService = discussionsService;
    }
    findAll(pagination) {
        return this.discussionsService.findAll(pagination);
    }
    findBySubmission(submissionId) {
        return this.discussionsService.findBySubmission(submissionId);
    }
    findOne(id) {
        return this.discussionsService.findOne(id);
    }
    createThread(userId, dto) {
        return this.discussionsService.createThread({ ...dto, createdById: userId });
    }
    createMessage(threadId, userId, dto) {
        return this.discussionsService.createMessage(threadId, { ...dto, authorId: userId });
    }
    updateThread(id, dto) {
        return this.discussionsService.updateThread(id, dto);
    }
    remove(id) {
        return this.discussionsService.remove(id);
    }
};
exports.DiscussionsController = DiscussionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('submission/:submissionId'),
    __param(0, (0, common_1.Param)('submissionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "findBySubmission", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('threads'),
    __param(0, (0, user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_discussion_thread_dto_1.CreateDiscussionThreadDto]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "createThread", null);
__decorate([
    (0, common_1.Post)(':threadId/messages'),
    __param(0, (0, common_1.Param)('threadId')),
    __param(1, (0, user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_discussion_message_dto_1.CreateDiscussionMessageDto]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_discussion_thread_dto_1.UpdateDiscussionThreadDto]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "updateThread", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DiscussionsController.prototype, "remove", null);
exports.DiscussionsController = DiscussionsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('discussions'),
    __metadata("design:paramtypes", [discussions_service_1.DiscussionsService])
], DiscussionsController);
