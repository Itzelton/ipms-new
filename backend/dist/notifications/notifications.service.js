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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const notification_repository_1 = require("./repositories/notification.repository");
const notifications_gateway_1 = require("./notifications.gateway");
let NotificationsService = class NotificationsService {
    notificationRepository;
    notificationsGateway;
    constructor(notificationRepository, notificationsGateway) {
        this.notificationRepository = notificationRepository;
        this.notificationsGateway = notificationsGateway;
    }
    async findAll(pagination) {
        return this.notificationRepository.findAll(pagination);
    }
    async findOne(id) {
        return this.notificationRepository.findOne(id);
    }
    async create(dto) {
        const created = await this.notificationRepository.create({
            ...dto,
            type: dto.type ?? 'SYSTEM',
            title: dto.title ?? 'Notification',
            projectId: dto.projectId ?? undefined,
        });
        this.notificationsGateway.emitNew({
            ...created,
            createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : created.createdAt,
        });
        return created;
    }
    async update(id, dto) {
        const updated = await this.notificationRepository.update(id, dto);
        this.notificationsGateway.emitUpdated({
            ...updated,
            createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
        });
        return updated;
    }
    async remove(id) {
        return this.notificationRepository.remove(id);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [notification_repository_1.NotificationRepository,
        notifications_gateway_1.NotificationsGateway])
], NotificationsService);
