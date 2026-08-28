import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import { ChannelRepository } from './repositories/channel.repository';
import { CreateChannelDto } from './dto/create-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly repo: ChannelRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createChannel(dto: CreateChannelDto, userId: string) {
    const channel = await this.repo.createChannel({ ...dto, createdById: userId });
    await this.repo.addMember(channel.id, userId, 'OWNER');
    return channel;
  }

  async getMyChannels(userId: string) {
    const channels = await this.repo.findChannelsForUser(userId);
    const withUnread = await Promise.all(
      channels.map(async (ch) => ({
        ...ch,
        unread: await this.repo.getUnreadCount(ch.id, userId),
      })),
    );
    return withUnread;
  }

  async getChannel(id: string) {
    const ch = await this.repo.findChannel(id);
    if (!ch) throw new NotFoundException('Channel not found');
    return ch;
  }

  async getMessages(channelId: string, cursor?: string) {
    return this.repo.getMessages(channelId, cursor);
  }

  async getThreadReplies(parentId: string) {
    return this.repo.getThreadReplies(parentId);
  }

  async sendMessage(channelId: string, userId: string, dto: SendMessageDto) {
    const message = await this.repo.sendMessage(channelId, userId, dto);

    // Notify other members — wrapped so a notification failure never breaks the send
    try {
      const channel = await this.repo.findChannel(channelId);
      if (channel?.members) {
        for (const member of channel.members) {
          if (member.userId !== userId) {
            const role = await this.repo.getUserPrimaryRole(member.userId);
            const link = role === 'SUPERVISOR' ? '/supervisor/messages' : '/student/messages';
            await this.notificationsService.create({
              recipientId: member.userId,
              title: 'New message',
              message: `New message from ${channel.name}`,
              link,
            });
          }
        }
      }
    } catch { /* notification failure must not fail the message send */ }

    return message;
  }

  async editMessage(messageId: string, userId: string, dto: EditMessageDto) {
    const msg = await this.repo.findMessage(messageId);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.authorId !== userId) throw new ForbiddenException('Not your message');
    return this.repo.editMessage(messageId, dto.content);
  }

  async deleteMessage(messageId: string, userId: string) {
    const msg = await this.repo.findMessage(messageId);
    if (!msg) throw new NotFoundException('Message not found');
    if (msg.authorId !== userId) throw new ForbiddenException('Not your message');
    return this.repo.softDeleteMessage(messageId);
  }

  async toggleReaction(messageId: string, userId: string, emoji: string) {
    return this.repo.toggleReaction(messageId, userId, emoji);
  }

  async addMember(channelId: string, userId: string) {
    return this.repo.addMember(channelId, userId);
  }

  async markRead(channelId: string, userId: string) {
    return this.repo.updateLastRead(channelId, userId);
  }

  async getPinned(channelId: string) {
    return this.repo.getPinned(channelId);
  }

  async pinMessage(channelId: string, messageId: string, userId: string) {
    return this.repo.pinMessage(channelId, messageId, userId);
  }

  async unpinMessage(channelId: string, messageId: string) {
    return this.repo.unpinMessage(channelId, messageId);
  }

  async getDmChannel(userAId: string, userBId: string) {
    return this.repo.findOrCreateDm(userAId, userBId);
  }

  async searchMessages(query: string, channelId?: string) {
    return this.repo.searchMessages(query, channelId);
  }

  // Called by ProjectsService after project creation
  async provisionProjectChannels(projectId: string, createdById: string, studentId?: string, supervisorId?: string) {
    const general = await this.createChannel(
      { name: 'general', type: ChannelType.PROJECT_GENERAL, description: 'General project discussion', projectId },
      createdById,
    );
    const feedback = await this.createChannel(
      { name: 'feedback', type: ChannelType.PROJECT_FEEDBACK, description: 'Supervisor feedback lane', projectId },
      createdById,
    );

    const memberIds = [studentId, supervisorId].filter(Boolean) as string[];
    for (const id of memberIds) {
      if (id !== createdById) {
        await this.repo.addMember(general.id, id);
        await this.repo.addMember(feedback.id, id);
      }
    }

    return { general, feedback };
  }
}
