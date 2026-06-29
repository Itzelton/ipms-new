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
exports.NotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let NotificationRepository = class NotificationRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.notification.create({
            data: {
                recipientId: data.recipientId,
                type: data.type ?? 'SYSTEM',
                title: data.title ?? 'Notification',
                message: data.message,
                projectId: data.projectId,
                link: data.link,
                read: data.read ?? false,
            },
        });
    }
    async findAll(pagination) {
        const take = pagination.limit || 20;
        const skip = pagination.page ? (pagination.page - 1) * take : 0;
        return this.prisma.notification.findMany({ skip, take });
    }
    async findOne(id) {
        return this.prisma.notification.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.notification.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.notification.delete({ where: { id } });
    }
};
exports.NotificationRepository = NotificationRepository;
exports.NotificationRepository = NotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationRepository);
