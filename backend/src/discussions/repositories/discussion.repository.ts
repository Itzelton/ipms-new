import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDiscussionThreadDto } from '../dto/create-discussion-thread.dto';
import { CreateDiscussionMessageDto } from '../dto/create-discussion-message.dto';
import { UpdateDiscussionThreadDto } from '../dto/update-discussion-thread.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DiscussionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDto) {
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.discussionThread.findMany({ skip, take });
  }

  async findOne(id: string) {
    return this.prisma.discussionThread.findUnique({
      where: { id },
      include: {
        project: true,
        submission: { include: { author: true } },
        messages: {
          include: {
            author: true,
            replies: {
              include: { author: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createThread(data: CreateDiscussionThreadDto & { createdById?: string }) {
    return this.prisma.discussionThread.create({ data });
  }

  async findBySubmission(submissionId: string) {
    return this.prisma.discussionThread.findFirst({
      where: { submissionId },
      include: {
        project: true,
        submission: true,
        messages: {
          include: {
            author: true,
            replies: {
              include: { author: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async createMessage(threadId: string, data: CreateDiscussionMessageDto & { authorId: string }) {
    return this.prisma.discussionMessage.create({
      data: { ...data, threadId },
    });
  }

  async findUsersByMentionKeys(mentionKeys: string[]) {
    if (!mentionKeys.length) return [];
    const uniqueKeys = Array.from(new Set(mentionKeys.map((key) => key.toLowerCase())));
    return this.prisma.user.findMany({
      where: {
        OR: uniqueKeys.flatMap((key) => [
          { email: { contains: key, mode: 'insensitive' } },
          { firstName: { contains: key, mode: 'insensitive' } },
          { lastName: { contains: key, mode: 'insensitive' } },
          { preferredName: { contains: key, mode: 'insensitive' } },
        ]),
      },
      take: 10,
    });
  }

  async updateThread(id: string, data: UpdateDiscussionThreadDto) {
    return this.prisma.discussionThread.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.discussionThread.delete({ where: { id } });
  }
}
