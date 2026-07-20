import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ChannelType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { SendMessageDto } from '../dto/send-message.dto';

const msgInclude = {
  author: { select: { id: true, firstName: true, lastName: true, email: true } },
  reactions: {
    include: { user: { select: { id: true, firstName: true, lastName: true } } },
  },
  attachments: true,
  replies: {
    include: {
      author: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

@Injectable()
export class ChannelRepository {
  private readonly useInMemory = !process.env.DATABASE_URL;

  // ── in-memory store ──────────────────────────────────────────────────────
  private channels: any[] = [];
  private members: any[] = [];
  private messages: any[] = [];
  private reactions: any[] = [];
  private pinned: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  // ── Channels ─────────────────────────────────────────────────────────────

  async createChannel(dto: CreateChannelDto & { createdById: string }): Promise<any> {
    const slug = `${dto.name.toLowerCase().replace(/\s+/g, '-')}-${randomUUID().slice(0, 6)}`;
    if (this.useInMemory) {
      const ch = { id: randomUUID(), ...dto, slug, createdAt: new Date(), updatedAt: new Date(), members: [], messages: [] };
      this.channels.push(ch);
      return ch;
    }
    return this.prisma.channel.create({ data: { ...dto, slug } });
  }

  async findChannelsForUser(userId: string): Promise<any[]> {
    if (this.useInMemory) {
      return this.channels.filter((c) => this.members.some((m) => m.channelId === c.id && m.userId === userId));
    }
    return this.prisma.channel.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findChannel(id: string): Promise<any> {
    if (this.useInMemory) {
      return this.channels.find((c) => c.id === id) ?? null;
    }
    return this.prisma.channel.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      },
    });
  }

  async addMember(channelId: string, userId: string, role = 'MEMBER'): Promise<any> {
    if (this.useInMemory) {
      const existing = this.members.find((m) => m.channelId === channelId && m.userId === userId);
      if (existing) return existing;
      const m = { channelId, userId, role, lastReadAt: null, joinedAt: new Date() };
      this.members.push(m);
      return m;
    }
    return this.prisma.channelMember.upsert({
      where: { channelId_userId: { channelId, userId } },
      create: { channelId, userId, role },
      update: {},
    });
  }

  async updateLastRead(channelId: string, userId: string): Promise<void> {
    if (this.useInMemory) {
      const m = this.members.find((x) => x.channelId === channelId && x.userId === userId);
      if (m) m.lastReadAt = new Date();
      return;
    }
    await this.prisma.channelMember.update({
      where: { channelId_userId: { channelId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  async getMessages(channelId: string, cursor?: string, limit = 40): Promise<any[]> {
    if (this.useInMemory) {
      const msgs = this.messages
        .filter((m) => m.channelId === channelId && !m.parentId)
        .sort((a, b) => a.createdAt - b.createdAt);
      return msgs.slice(-limit);
    }
    const args: any = {
      where: { channelId, parentId: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: msgInclude,
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }
    return this.prisma.message.findMany(args);
  }

  async getThreadReplies(parentId: string): Promise<any[]> {
    if (this.useInMemory) {
      return this.messages.filter((m) => m.parentId === parentId).sort((a, b) => a.createdAt - b.createdAt);
    }
    return this.prisma.message.findMany({
      where: { parentId },
      orderBy: { createdAt: 'asc' },
      include: msgInclude,
    });
  }

  async sendMessage(channelId: string, authorId: string, dto: SendMessageDto): Promise<any> {
    if (this.useInMemory) {
      const msg = {
        id: randomUUID(),
        channelId,
        authorId,
        content: dto.content,
        parentId: dto.parentId ?? null,
        editedAt: null,
        deletedAt: null,
        createdAt: new Date(),
        author: { id: authorId, firstName: 'User', lastName: '', email: '' },
        reactions: [],
        attachments: [],
        replies: [],
      };
      this.messages.push(msg);
      return msg;
    }
    const msg = await this.prisma.message.create({
      data: { channelId, authorId, content: dto.content, parentId: dto.parentId },
      include: msgInclude,
    });
    await this.prisma.channel.update({ where: { id: channelId }, data: { updatedAt: new Date() } });
    return msg;
  }

  async editMessage(messageId: string, content: string): Promise<any> {
    if (this.useInMemory) {
      const msg = this.messages.find((m) => m.id === messageId);
      if (msg) { msg.content = content; msg.editedAt = new Date(); }
      return msg;
    }
    return this.prisma.message.update({
      where: { id: messageId },
      data: { content, editedAt: new Date() },
      include: msgInclude,
    });
  }

  async softDeleteMessage(messageId: string): Promise<any> {
    if (this.useInMemory) {
      const msg = this.messages.find((m) => m.id === messageId);
      if (msg) { msg.content = ''; msg.deletedAt = new Date(); }
      return msg;
    }
    return this.prisma.message.update({
      where: { id: messageId },
      data: { content: '', deletedAt: new Date() },
      include: msgInclude,
    });
  }

  async findMessage(messageId: string): Promise<any> {
    if (this.useInMemory) return this.messages.find((m) => m.id === messageId) ?? null;
    return this.prisma.message.findUnique({ where: { id: messageId }, include: msgInclude });
  }

  // ── Reactions ─────────────────────────────────────────────────────────────

  async toggleReaction(messageId: string, userId: string, emoji: string): Promise<any[]> {
    if (this.useInMemory) {
      const idx = this.reactions.findIndex((r) => r.messageId === messageId && r.userId === userId && r.emoji === emoji);
      if (idx >= 0) this.reactions.splice(idx, 1);
      else this.reactions.push({ messageId, userId, emoji, createdAt: new Date() });
      return this.reactions.filter((r) => r.messageId === messageId);
    }
    const existing = await this.prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });
    if (existing) {
      await this.prisma.messageReaction.delete({ where: { messageId_userId_emoji: { messageId, userId, emoji } } });
    } else {
      await this.prisma.messageReaction.create({ data: { messageId, userId, emoji } });
    }
    return this.prisma.messageReaction.findMany({
      where: { messageId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  // ── Pinned messages ───────────────────────────────────────────────────────

  async getPinned(channelId: string): Promise<any[]> {
    if (this.useInMemory) return this.pinned.filter((p) => p.channelId === channelId);
    return this.prisma.pinnedMessage.findMany({
      where: { channelId },
      include: { message: { include: msgInclude } },
      orderBy: { pinnedAt: 'desc' },
    });
  }

  async pinMessage(channelId: string, messageId: string, pinnedById: string): Promise<void> {
    if (this.useInMemory) {
      const exists = this.pinned.find((p) => p.channelId === channelId && p.messageId === messageId);
      if (!exists) this.pinned.push({ channelId, messageId, pinnedById, pinnedAt: new Date() });
      return;
    }
    await this.prisma.pinnedMessage.upsert({
      where: { channelId_messageId: { channelId, messageId } },
      create: { channelId, messageId, pinnedById },
      update: {},
    });
  }

  async unpinMessage(channelId: string, messageId: string): Promise<void> {
    if (this.useInMemory) {
      const idx = this.pinned.findIndex((p) => p.channelId === channelId && p.messageId === messageId);
      if (idx >= 0) this.pinned.splice(idx, 1);
      return;
    }
    await this.prisma.pinnedMessage.delete({ where: { channelId_messageId: { channelId, messageId } } });
  }

  // ── Unread counts ─────────────────────────────────────────────────────────

  async getUnreadCount(channelId: string, userId: string): Promise<number> {
    if (this.useInMemory) return 0;
    const member = await this.prisma.channelMember.findUnique({
      where: { channelId_userId: { channelId, userId } },
    });
    if (!member?.lastReadAt) {
      return this.prisma.message.count({ where: { channelId, parentId: null, deletedAt: null } });
    }
    return this.prisma.message.count({
      where: { channelId, parentId: null, deletedAt: null, createdAt: { gt: member.lastReadAt } },
    });
  }

  // ── DM channel lookup ─────────────────────────────────────────────────────

  async findOrCreateDm(userAId: string, userBId: string): Promise<any> {
    const slug = ['dm', userAId, userBId].sort().join('-');
    if (this.useInMemory) {
      let ch = this.channels.find((c) => c.slug === slug);
      if (!ch) {
        ch = { id: randomUUID(), name: 'DM', slug, type: 'DIRECT', projectId: null, createdById: userAId, createdAt: new Date(), updatedAt: new Date() };
        this.channels.push(ch);
        this.members.push({ channelId: ch.id, userId: userAId, role: 'MEMBER', lastReadAt: null, joinedAt: new Date() });
        this.members.push({ channelId: ch.id, userId: userBId, role: 'MEMBER', lastReadAt: null, joinedAt: new Date() });
      }
      return ch;
    }
    let ch = await this.prisma.channel.findUnique({ where: { slug } });
    if (!ch) {
      ch = await this.prisma.channel.create({
        data: { name: 'DM', slug, type: ChannelType.DIRECT, createdById: userAId },
      });
      await Promise.all([
        this.prisma.channelMember.create({ data: { channelId: ch.id, userId: userAId } }),
        this.prisma.channelMember.create({ data: { channelId: ch.id, userId: userBId } }),
      ]);
    }
    return ch;
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async searchMessages(query: string, channelId?: string): Promise<any[]> {
    if (this.useInMemory) {
      return this.messages.filter((m) =>
        (!channelId || m.channelId === channelId) &&
        m.content.toLowerCase().includes(query.toLowerCase()) &&
        !m.deletedAt,
      );
    }
    return this.prisma.message.findMany({
      where: {
        ...(channelId ? { channelId } : {}),
        content: { contains: query, mode: 'insensitive' },
        deletedAt: null,
      },
      include: msgInclude,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }
}
