import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AssignSupervisorDto } from './dto/assign-supervisor.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UpdateProjectTypeDto } from './dto/update-project-type.dto';
import { AddCollaboratorDto } from './dto/add-collaborator.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateCollaboratorLimitDto } from './dto/update-collaborator-limit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto, @CurrentUser('id') userId: string) {
    return this.projectsService.findAll(pagination, userId);
  }

  // Must be before @Get(':id') so 'proposals' is not captured as a project id
  @Get('proposals')
  findProposals(@CurrentUser('id') userId: string) {
    return this.projectsService.findProposalsForSupervisor(userId);
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
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser('id') userId: string) {
    return this.projectsService.create({ ...createProjectDto, studentId: createProjectDto.studentId ?? userId }, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @CurrentUser('id') actorId: string) {
    return this.projectsService.update(id, updateProjectDto, actorId);
  }

  @Patch(':id/assign-supervisor')
  assignSupervisor(@Param('id') id: string, @Body() dto: AssignSupervisorDto) {
    return this.projectsService.assignSupervisor(id, dto.supervisorId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateProjectStatusDto, @CurrentUser('id') actorId: string) {
    return this.projectsService.updateStatus(id, dto.status, actorId);
  }

  @Patch(':id/type')
  updateType(@Param('id') id: string, @Body() dto: UpdateProjectTypeDto) {
    return this.projectsService.updateType(id, dto.type);
  }

  @Get(':id/collaborators')
  findCollaborators(@Param('id') id: string) {
    return this.projectsService.findCollaborators(id);
  }

  @Patch(':id/collaborator-limit')
  updateCollaboratorLimit(
    @Param('id') id: string,
    @Body() dto: UpdateCollaboratorLimitDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.projectsService.updateCollaboratorLimit(id, dto.collaboratorLimit, actorId);
  }

  @Get(':id/invites')
  listInvites(@Param('id') id: string) {
    return this.projectsService.listInvites(id);
  }

  @Post(':id/invites')
  createInvite(
    @Param('id') id: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.projectsService.createInvite(id, dto.role, actorId, dto.expiresInDays);
  }

  @Delete(':id/invites/:token')
  revokeInvite(@Param('token') token: string, @CurrentUser('id') actorId: string) {
    return this.projectsService.revokeInvite(token, actorId);
  }

  @Post(':id/collaborators')
  addCollaborator(
    @Param('id') id: string,
    @Body() dto: AddCollaboratorDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.projectsService.addCollaboratorByEmail(id, dto.email, dto.role, actorId);
  }

  @Delete(':id/collaborators/:userId')
  removeCollaborator(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser('id') actorId: string,
  ) {
    return this.projectsService.removeCollaborator(id, userId, actorId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
