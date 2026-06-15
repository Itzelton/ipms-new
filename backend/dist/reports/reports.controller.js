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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const create_report_dto_1 = require("./dto/create-report.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const reports_generation_service_1 = require("./reports-generation.service");
const export_student_progress_dto_1 = require("./dto/export-student-progress.dto");
const export_project_health_dto_1 = require("./dto/export-project-health.dto");
const export_supervisor_performance_dto_1 = require("./dto/export-supervisor-performance.dto");
let ReportsController = class ReportsController {
    reportsService;
    reportsGenerationService;
    constructor(reportsService, reportsGenerationService) {
        this.reportsService = reportsService;
        this.reportsGenerationService = reportsGenerationService;
    }
    findAll(scope) {
        return this.reportsService.findAll(scope);
    }
    findOne(id) {
        return this.reportsService.findOne(id);
    }
    create(createReportDto) {
        return this.reportsService.create(createReportDto);
    }
    remove(id) {
        return this.reportsService.remove(id);
    }
    async exportStudentProgress(dto, res) {
        const { buffer, filename, mimeType } = await this.reportsGenerationService.exportStudentProgress({
            scope: dto.scope,
            projectId: dto.projectId,
            supervisorId: dto.supervisorId,
            cohortId: dto.cohortId,
            departmentId: dto.departmentId,
            dateRange: dto.dateRange,
            format: dto.format,
            filename: dto.filename,
        });
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    }
    async exportProjectHealth(dto, res) {
        const { buffer, filename, mimeType } = await this.reportsGenerationService.exportProjectHealth({
            scope: dto.scope,
            projectId: dto.projectId,
            supervisorId: dto.supervisorId,
            cohortId: dto.cohortId,
            departmentId: dto.departmentId,
            dateRange: dto.dateRange,
            format: dto.format,
            filename: dto.filename,
        });
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    }
    async exportSupervisorPerformance(dto, res) {
        const { buffer, filename, mimeType } = await this.reportsGenerationService.exportSupervisorPerformance({
            scope: dto.scope,
            projectId: dto.projectId,
            supervisorId: dto.supervisorId,
            cohortId: dto.cohortId,
            departmentId: dto.departmentId,
            dateRange: dto.dateRange,
            format: dto.format,
            filename: dto.filename,
        });
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(buffer);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('scope')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_report_dto_1.CreateReportDto]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReportsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('export/student-progress'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_student_progress_dto_1.ExportStudentProgressReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportStudentProgress", null);
__decorate([
    (0, common_1.Post)('export/project-health'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_project_health_dto_1.ExportProjectHealthReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportProjectHealth", null);
__decorate([
    (0, common_1.Post)('export/supervisor-performance'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_supervisor_performance_dto_1.ExportSupervisorPerformanceReportDto, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportSupervisorPerformance", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService,
        reports_generation_service_1.ReportsGenerationService])
], ReportsController);
