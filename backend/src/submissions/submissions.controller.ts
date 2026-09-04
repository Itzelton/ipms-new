import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { CreateSubmissionVersionDto } from './dto/create-submission-version.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Get('for-supervisor')
  findForSupervisor(@CurrentUser('id') userId: string, @Query() pagination: PaginationDto) {
    return this.submissionsService.findBySupervisor(userId, pagination);
  }

  @Get('admin/reviewed')
  findReviewed(@Query() pagination: PaginationDto) {
    return this.submissionsService.findReviewed(pagination);
  }

  @Get('admin/all')
  findAllAdmin(@Query() pagination: PaginationDto) {
    return this.submissionsService.findAll(pagination);
  }

  @Get()
  findAll(@Query() query: SubmissionQueryDto, @CurrentUser('id') userId: string) {
    const { projectId, ...pagination } = query;
    return this.submissionsService.findByAuthor(userId, pagination, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createSubmissionDto: CreateSubmissionDto) {
    return this.submissionsService.create(createSubmissionDto, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Post(':id/versions')
  createVersion(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: CreateSubmissionVersionDto) {
    return this.submissionsService.createVersion(id, userId, dto);
  }

  @Get(':id/versions')
  listVersions(@Param('id') id: string) {
    return this.submissionsService.listVersions(id);
  }

  @Get(':id/versions/:versionNumber')
  getVersion(@Param('id') id: string, @Param('versionNumber') versionNumber: string) {
    return this.submissionsService.getVersion(id, Number(versionNumber));
  }

  @Post(':id/versions/:versionId/revert')
  revertToVersion(@Param('id') id: string, @Param('versionId') versionId: string, @CurrentUser('id') userId: string) {
    return this.submissionsService.revertToVersion(id, versionId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.submissionsService.remove(id);
  }
}
