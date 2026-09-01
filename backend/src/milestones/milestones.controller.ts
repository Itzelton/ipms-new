import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { MilestoneQueryDto } from './dto/milestone-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Get()
  findAll(@Query() query: MilestoneQueryDto) {
    const { projectId, ...pagination } = query;
    return this.milestonesService.findAll(pagination, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Post()
  create(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestonesService.create(createMilestoneDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto) {
    return this.milestonesService.update(id, updateMilestoneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.milestonesService.remove(id);
  }
}
