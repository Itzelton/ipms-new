import { Body, Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReportsGenerationService } from './reports-generation.service';
import { ExportStudentProgressReportDto } from './dto/export-student-progress.dto';
import { ExportProjectHealthReportDto } from './dto/export-project-health.dto';
import { ExportSupervisorPerformanceReportDto } from './dto/export-supervisor-performance.dto';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportsGenerationService: ReportsGenerationService,
  ) {}

  @Get()
  findAll(@Query('scope') scope?: string) {
    return this.reportsService.findAll(scope);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(id);
  }

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(id);
  }

  @Post('export/student-progress')
  async exportStudentProgress(
    @Body() dto: ExportStudentProgressReportDto,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.reportsGenerationService.exportStudentProgress({
      scope: dto.scope,
      projectId: dto.projectId,
      supervisorId: dto.supervisorId,
      cohortId: dto.cohortId,
      departmentId: dto.departmentId,
      dateRange: dto.dateRange,
      format: dto.format,
      filename: (dto as any).filename,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @Post('export/project-health')
  async exportProjectHealth(
    @Body() dto: ExportProjectHealthReportDto,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.reportsGenerationService.exportProjectHealth({
      scope: dto.scope,
      projectId: dto.projectId,
      supervisorId: dto.supervisorId,
      cohortId: dto.cohortId,
      departmentId: dto.departmentId,
      dateRange: dto.dateRange,
      format: (dto as any).format,
      filename: (dto as any).filename,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }

  @Post('export/supervisor-performance')
  async exportSupervisorPerformance(
    @Body() dto: ExportSupervisorPerformanceReportDto,
    @Res() res: Response,
  ) {
    const { buffer, filename, mimeType } = await this.reportsGenerationService.exportSupervisorPerformance({
      scope: dto.scope,
      projectId: dto.projectId,
      supervisorId: dto.supervisorId,
      cohortId: dto.cohortId,
      departmentId: dto.departmentId,
      dateRange: dto.dateRange,
      format: (dto as any).format,
      filename: (dto as any).filename,
    });

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  }
}

