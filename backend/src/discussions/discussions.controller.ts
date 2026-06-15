import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DiscussionsService } from './discussions.service';
import { CreateDiscussionThreadDto } from './dto/create-discussion-thread.dto';
import { CreateDiscussionMessageDto } from './dto/create-discussion-message.dto';
import { UpdateDiscussionThreadDto } from './dto/update-discussion-thread.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('discussions')
export class DiscussionsController {
  constructor(private readonly discussionsService: DiscussionsService) {}

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.discussionsService.findAll(pagination);
  }

  @Get('submission/:submissionId')
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.discussionsService.findBySubmission(submissionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discussionsService.findOne(id);
  }

  @Post('threads')
  createThread(@CurrentUser('id') userId: string, @Body() dto: CreateDiscussionThreadDto) {
    return this.discussionsService.createThread({ ...dto, createdById: userId });
  }

  @Post(':threadId/messages')
  createMessage(@Param('threadId') threadId: string, @CurrentUser('id') userId: string, @Body() dto: CreateDiscussionMessageDto) {
    return this.discussionsService.createMessage(threadId, { ...dto, authorId: userId });
  }

  @Patch(':id')
  updateThread(@Param('id') id: string, @Body() dto: UpdateDiscussionThreadDto) {
    return this.discussionsService.updateThread(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discussionsService.remove(id);
  }
}
