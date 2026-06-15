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
exports.ReportsGenerationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const student_progress_generator_1 = require("./report-generators/student-progress.generator");
const project_health_generator_1 = require("./report-generators/project-health.generator");
const supervisor_performance_generator_1 = require("./report-generators/supervisor-performance.generator");
const excel_exporter_1 = require("./export/excel-exporter");
const pdf_exporter_1 = require("./export/pdf-exporter");
let ReportsGenerationService = class ReportsGenerationService {
    prisma;
    studentProgressGenerator;
    projectHealthGenerator;
    supervisorPerformanceGenerator;
    excelExporter;
    pdfExporter;
    constructor(prisma) {
        this.prisma = prisma;
        this.studentProgressGenerator = new student_progress_generator_1.StudentProgressGenerator(prisma);
        this.projectHealthGenerator = new project_health_generator_1.ProjectHealthGenerator(prisma);
        this.supervisorPerformanceGenerator = new supervisor_performance_generator_1.SupervisorPerformanceGenerator(prisma);
        this.excelExporter = new excel_exporter_1.ExcelExporter();
        this.pdfExporter = new pdf_exporter_1.PdfExporter();
    }
    async exportStudentProgress(params) {
        const report = await this.studentProgressGenerator.generate(params);
        return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'student-progress-report');
    }
    async exportProjectHealth(params) {
        const report = await this.projectHealthGenerator.generate(params);
        return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'project-health-report');
    }
    async exportSupervisorPerformance(params) {
        const report = await this.supervisorPerformanceGenerator.generate(params);
        return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'supervisor-performance-report');
    }
    async exportTabularOrJson(title, rows, format, filenameBase) {
        if (format === 'excel') {
            const allKeys = new Set();
            for (const r of rows)
                Object.keys(r ?? {}).forEach((k) => allKeys.add(k));
            const columns = [...allKeys].map((k) => ({ header: k, key: k }));
            const buffer = await this.excelExporter.generateWorkbook({ title, columns, rows });
            return {
                buffer,
                filename: `${filenameBase}.xlsx`,
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            };
        }
        const buffer = await this.pdfExporter.generate({ title, rows });
        return { buffer, filename: `${filenameBase}.pdf`, mimeType: 'application/pdf' };
    }
};
exports.ReportsGenerationService = ReportsGenerationService;
exports.ReportsGenerationService = ReportsGenerationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsGenerationService);
