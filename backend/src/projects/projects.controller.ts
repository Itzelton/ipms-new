import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignSupervisorDto } from './dto/assign-supervisor.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.projectsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/details')
  findDetails(@Param('id') id: string) {
    return this.projectsService.findDetails(id);
  }

  @Get(':id/health')
  findHealth(@Param('id') id: string) {
    return this.projectsService.getHealthScore(id);
  }

  @Get(':id/risk')
  findRisk(@Param('id') id: string) {
    return this.projectsService.getRiskStatus(id);
  }

  @Get(':id/recommendations')
  findRecommendations(@Param('id') id: string) {
    return this.projectsService.getRecommendations(id);
  }

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/assign-supervisor')
  assignSupervisor(@Param('id') id: string, @Body() dto: AssignSupervisorDto) {
    return this.projectsService.assignSupervisor(id, dto.supervisorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(id, dto.status);
  }

  @Patch(':id/type')
  updateType(@Param('id') id: string, @Body() dto: UpdateProjectTypeDto) {
    return this.projectsService.updateType(id, dto.type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
