import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';

@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  findMine(@CurrentUser('id') userId: string, @CurrentUser('roles') roles: string[]) {
    if (roles?.includes('SUPERVISOR')) {
      return this.meetingsService.findForSupervisor(userId);
    }
    return this.meetingsService.findForStudent(userId);
  }

  @Post()
  create(@CurrentUser('id') supervisorId: string, @Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(supervisorId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.meetingsService.remove(id, userId);
  }
}
