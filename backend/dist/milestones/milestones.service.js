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
exports.MilestonesService = void 0;
const common_1 = require("@nestjs/common");
const milestone_repository_1 = require("./repositories/milestone.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const audit_service_1 = require("../audit/audit.service");
let MilestonesService = class MilestonesService {
    milestoneRepository;
    notificationsService;
    auditService;
    constructor(milestoneRepository, notificationsService, auditService) {
        this.milestoneRepository = milestoneRepository;
        this.notificationsService = notificationsService;
        this.auditService = auditService;
    }
    async create(createMilestoneDto, actorId) {
        const m = await this.milestoneRepository.create(createMilestoneDto);
        await this.auditService.log(actorId || null, 'create_milestone', 'Milestone', m.id, { title: m.title });
        await this.notificationsService.create({ recipientId: createMilestoneDto.projectId ? undefined : '', message: `Milestone created: ${m.title}`, link: `/projects/${createMilestoneDto.projectId}/milestones/${m.id}` });
        return m;
    }
    async findAll(pagination) {
        return this.milestoneRepository.findAll(pagination);
    }
    async findOne(id) {
        return this.milestoneRepository.findOne(id);
    }
    async update(id, updateMilestoneDto, actorId) {
        const m = await this.milestoneRepository.update(id, updateMilestoneDto);
        await this.auditService.log(actorId || null, 'update_milestone', 'Milestone', id, updateMilestoneDto);
        return m;
    }
    async remove(id, actorId) {
        const res = await this.milestoneRepository.remove(id);
        await this.auditService.log(actorId || null, 'delete_milestone', 'Milestone', id, {});
        return res;
    }
};
exports.MilestonesService = MilestonesService;
exports.MilestonesService = MilestonesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [milestone_repository_1.MilestoneRepository,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService])
], MilestonesService);
