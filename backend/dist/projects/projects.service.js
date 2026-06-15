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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const project_repository_1 = require("./repositories/project.repository");
const notifications_service_1 = require("../notifications/notifications.service");
const audit_service_1 = require("../audit/audit.service");
const project_health_service_1 = require("./project-health.service");
let ProjectsService = class ProjectsService {
    projectRepository;
    notificationsService;
    auditService;
    projectHealthService;
    constructor(projectRepository, notificationsService, auditService, projectHealthService) {
        this.projectRepository = projectRepository;
        this.notificationsService = notificationsService;
        this.auditService = auditService;
        this.projectHealthService = projectHealthService;
    }
    async create(createProjectDto, actorId) {
        const project = await this.projectRepository.create(createProjectDto);
        await this.auditService.log(actorId || null, 'create_project', 'Project', project.id, { title: project.title });
        await this.notificationsService.create({ recipientId: createProjectDto.supervisorId || '', message: `Project created: ${project.title}`, link: `/projects/${project.id}` });
        return project;
    }
    async findAll(pagination) {
        return this.projectRepository.findAll(pagination);
    }
    async findOne(id) {
        return this.projectRepository.findOne(id);
    }
    async findDetails(id) {
        const details = await this.projectRepository.findDetails(id);
        if (!details)
            return null;
        const [healthScore, riskStatus, recommendations] = await Promise.all([
            this.projectHealthService.compute(id),
            this.projectHealthService.computeRisk(id),
            this.projectHealthService.computeRecommendations(id),
        ]);
        details.healthScore = healthScore;
        details.riskStatus = riskStatus;
        details.recommendedActions = recommendations;
        return details;
    }
    async getHealthScore(id) {
        return this.projectHealthService.compute(id);
    }
    async getRiskStatus(id) {
        return this.projectHealthService.computeRisk(id);
    }
    async getRecommendations(id) {
        return this.projectHealthService.computeRecommendations(id);
    }
    async update(id, updateProjectDto, actorId) {
        const project = await this.projectRepository.update(id, updateProjectDto);
        await this.auditService.log(actorId || null, 'update_project', 'Project', id, updateProjectDto);
        return project;
    }
    async assignSupervisor(id, supervisorId, actorId) {
        const project = await this.projectRepository.assignSupervisor(id, supervisorId);
        await this.auditService.log(actorId || null, 'assign_supervisor', 'Project', id, { supervisorId });
        await this.notificationsService.create({ recipientId: supervisorId, message: `You were assigned as supervisor to project ${project.title}`, link: `/projects/${id}` });
        return project;
    }
    async updateStatus(id, status, actorId) {
        const project = await this.projectRepository.updateStatus(id, status);
        await this.auditService.log(actorId || null, 'update_project_status', 'Project', id, { status });
        return project;
    }
    async updateType(id, type, actorId) {
        const project = await this.projectRepository.updateType(id, type);
        await this.auditService.log(actorId || null, 'update_project_type', 'Project', id, { type });
        return project;
    }
    async remove(id, actorId) {
        const res = await this.projectRepository.remove(id);
        await this.auditService.log(actorId || null, 'delete_project', 'Project', id, {});
        return res;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [project_repository_1.ProjectRepository,
        notifications_service_1.NotificationsService,
        audit_service_1.AuditService,
        project_health_service_1.ProjectHealthService])
], ProjectsService);
