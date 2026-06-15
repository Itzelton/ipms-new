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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const assign_supervisor_dto_1 = require("./dto/assign-supervisor.dto");
const update_project_status_dto_1 = require("./dto/update-project-status.dto");
const update_project_type_dto_1 = require("./dto/update-project-type.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    findAll(pagination) {
        return this.projectsService.findAll(pagination);
    }
    findOne(id) {
        return this.projectsService.findOne(id);
    }
    findDetails(id) {
        return this.projectsService.findDetails(id);
    }
    findHealth(id) {
        return this.projectsService.getHealthScore(id);
    }
    findRisk(id) {
        return this.projectsService.getRiskStatus(id);
    }
    findRecommendations(id) {
        return this.projectsService.getRecommendations(id);
    }
    create(createProjectDto) {
        return this.projectsService.create(createProjectDto);
    }
    update(id, updateProjectDto) {
        return this.projectsService.update(id, updateProjectDto);
    }
    assignSupervisor(id, dto) {
        return this.projectsService.assignSupervisor(id, dto.supervisorId);
    }
    updateStatus(id, dto) {
        return this.projectsService.updateStatus(id, dto.status);
    }
    updateType(id, dto) {
        return this.projectsService.updateType(id, dto.type);
    }
    remove(id) {
        return this.projectsService.remove(id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/details'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findDetails", null);
__decorate([
    (0, common_1.Get)(':id/health'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findHealth", null);
__decorate([
    (0, common_1.Get)(':id/risk'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findRisk", null);
__decorate([
    (0, common_1.Get)(':id/recommendations'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "findRecommendations", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign-supervisor'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, assign_supervisor_dto_1.AssignSupervisorDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "assignSupervisor", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_status_dto_1.UpdateProjectStatusDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id/type'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_type_dto_1.UpdateProjectTypeDto]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "updateType", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectsController.prototype, "remove", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
