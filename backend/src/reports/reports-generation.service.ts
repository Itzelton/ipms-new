import { Injectable, StreamableFile } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StudentProgressGenerator } from './report-generators/student-progress.generator';
import { ProjectHealthGenerator } from './report-generators/project-health.generator';
import { SupervisorPerformanceGenerator } from './report-generators/supervisor-performance.generator';
import { ExcelExporter } from './export/excel-exporter';
import { PdfExporter } from './export/pdf-exporter';

@Injectable()
export class ReportsGenerationService {
  private readonly studentProgressGenerator: StudentProgressGenerator;
  private readonly projectHealthGenerator: ProjectHealthGenerator;
  private readonly supervisorPerformanceGenerator: SupervisorPerformanceGenerator;

  private readonly excelExporter: ExcelExporter;
  private readonly pdfExporter: PdfExporter;

  constructor(private readonly prisma: PrismaService) {
    this.studentProgressGenerator = new StudentProgressGenerator(prisma);
    this.projectHealthGenerator = new ProjectHealthGenerator(prisma);
    this.supervisorPerformanceGenerator = new SupervisorPerformanceGenerator(prisma);

    this.excelExporter = new ExcelExporter();
    this.pdfExporter = new PdfExporter();
  }

  async exportStudentProgress(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    // ISO date ranges are accepted but currently not parsed strictly.
    dateRange?: string;
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    // export
    format: 'pdf' | 'excel';
    filename?: string;
  }): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const report = await this.studentProgressGenerator.generate(params);
    return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'student-progress-report');
  }

  async exportProjectHealth(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
    format: 'pdf' | 'excel';
    filename?: string;
  }): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const report = await this.projectHealthGenerator.generate(params);
    return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'project-health-report');
  }

  async exportSupervisorPerformance(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
    format: 'pdf' | 'excel';
    filename?: string;
  }): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const report = await this.supervisorPerformanceGenerator.generate(params);
    return this.exportTabularOrJson(report.title, report.rows, params.format, params.filename ?? 'supervisor-performance-report');
  }

  private async exportTabularOrJson(
    title: string,
    rows: Record<string, any>[],
    format: 'pdf' | 'excel',
    filenameBase: string,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    if (format === 'excel') {
      const allKeys = new Set<string>();
      for (const r of rows) Object.keys(r ?? {}).forEach((k) => allKeys.add(k));

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
}

