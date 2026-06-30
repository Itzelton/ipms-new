import { Injectable } from '@nestjs/common';
import { CreateDiscussionThreadDto } from './dto/create-discussion-thread.dto';
import { CreateDiscussionMessageDto } from './dto/create-discussion-message.dto';
import { UpdateDiscussionThreadDto } from './dto/update-discussion-thread.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { DiscussionRepository } from './repositories/discussion.repository';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DiscussionsService {
  constructor(
    private readonly discussionRepository: DiscussionRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(pagination: PaginationDto) {
    return this.discussionRepository.findAll(pagination);
  }

  async findOne(id: string) {
    return this.discussionRepository.findOne(id);
  }

  async findBySubmission(submissionId: string) {
    return this.discussionRepository.findBySubmission(submissionId);
  }

  async createThread(dto: CreateDiscussionThreadDto & { createdById: string }) {
    return this.discussionRepository.createThread(dto);
  }

  async createMessage(threadId: string, dto: CreateDiscussionMessageDto & { authorId: string }) {
    const thread = await this.discussionRepository.findOne(threadId);
    const message = await this.discussionRepository.createMessage(threadId, dto);
    const mentionKeys = Array.from(new Set((dto.content.match(/@([\w.-]+)/g) || []).map((match) => match.slice(1))));
    const mentionedUsers = await this.discussionRepository.findUsersByMentionKeys(mentionKeys);
    const recipientIds = new Set<string>();

    if (thread?.createdById && thread.createdById !== dto.authorId) {
      recipientIds.add(thread.createdById);
    }

    if (thread?.submission?.authorId && thread.submission.authorId !== dto.authorId) {
      recipientIds.add(thread.submission.authorId);
    }

    for (const user of mentionedUsers) {
      if (user.id !== dto.authorId) {
        recipientIds.add(user.id);
      }
    }

    for (const recipientId of recipientIds) {
      await this.notificationsService.create({
        recipientId,
        message: `New discussion reply in thread ${thread?.title || threadId}`,
        link: `/discussions/${threadId}`,
      });
    }

    return message;
  }

  async updateThread(id: string, dto: UpdateDiscussionThreadDto) {
    return this.discussionRepository.updateThread(id, dto);
  }

  async remove(id: string) {
    return this.discussionRepository.remove(id);
  }
}
