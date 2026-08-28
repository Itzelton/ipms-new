import {
  Body, Controller, Delete, Get, Param, Post, Patch, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ChannelsService } from './channels.service';
import { ChannelsGateway } from './channels.gateway';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly channelsGateway: ChannelsGateway,
  ) {}

  // ── Channels ──────────────────────────────────────────────────────────────

  @Get()
  getMyChannels(@CurrentUser('id') userId: string) {
    return this.channelsService.getMyChannels(userId);
  }

  @Post()
  createChannel(@CurrentUser('id') userId: string, @Body() dto: CreateChannelDto) {
    return this.channelsService.createChannel(dto, userId);
  }

  @Get('search')
  searchMessages(
    @Query('q') q: string,
    @Query('channelId') channelId?: string,
  ) {
    return this.channelsService.searchMessages(q, channelId);
  }

  @Get('dm/:userId')
  getDm(@CurrentUser('id') meId: string, @Param('userId') otherId: string) {
    return this.channelsService.getDmChannel(meId, otherId);
  }

  @Get(':id')
  getChannel(@Param('id') id: string) {
    return this.channelsService.getChannel(id);
  }

  @Post(':id/members')
  addMember(@Param('id') channelId: string, @Body('userId') userId: string) {
    return this.channelsService.addMember(channelId, userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') channelId: string, @CurrentUser('id') userId: string) {
    return this.channelsService.markRead(channelId, userId);
  }

  @Get(':id/pinned')
  getPinned(@Param('id') channelId: string) {
    return this.channelsService.getPinned(channelId);
  }

  @Post(':id/pin/:messageId')
  pinMessage(
    @Param('id') channelId: string,
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.channelsService.pinMessage(channelId, messageId, userId);
  }

  @Delete(':id/pin/:messageId')
  unpinMessage(@Param('id') channelId: string, @Param('messageId') messageId: string) {
    return this.channelsService.unpinMessage(channelId, messageId);
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  @Get(':id/messages')
  getMessages(@Param('id') channelId: string, @Query('cursor') cursor?: string) {
    return this.channelsService.getMessages(channelId, cursor);
  }

  @Post(':id/messages')
  async sendMessage(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.channelsService.sendMessage(channelId, userId, dto);
    this.channelsGateway.emitNewMessage(channelId, message);
    return message;
  }

  @Get(':id/messages/:messageId/thread')
  getThread(@Param('messageId') messageId: string) {
    return this.channelsService.getThreadReplies(messageId);
  }

  @Patch(':id/messages/:messageId')
  editMessage(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.channelsService.editMessage(messageId, userId, dto);
  }

  @Delete(':id/messages/:messageId')
  deleteMessage(@Param('messageId') messageId: string, @CurrentUser('id') userId: string) {
    return this.channelsService.deleteMessage(messageId, userId);
  }

  @Post(':id/messages/:messageId/reactions')
  toggleReaction(
    @Param('messageId') messageId: string,
    @CurrentUser('id') userId: string,
    @Body('emoji') emoji: string,
  ) {
    return this.channelsService.toggleReaction(messageId, userId, emoji);
  }
}
