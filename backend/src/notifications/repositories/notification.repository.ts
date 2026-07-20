import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationRepository {
  private get useInMemoryData() { return !this.prisma.isConnected; }
  private readonly mockNotifications: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
    if (this.useInMemoryData) {
      const n = {
        id: randomUUID(),
        recipientId: data.recipientId,
        type: data.type ?? 'SYSTEM',
        title: data.title ?? 'Notification',
        message: data.message,
        projectId: data.projectId ?? null,
        link: data.link ?? null,
        read: data.read ?? false,
        createdAt: new Date(),
        deliveredAt: null,
      };
      this.mockNotifications.push(n);
      return n;
    }
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        type: data.type ?? 'SYSTEM',
        title: data.title ?? 'Notification',
        message: data.message,
        projectId: data.projectId,
        link: data.link,
        read: data.read ?? false,
      },
    });
  }

  async findAll(pagination: PaginationDto) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      return [...this.mockNotifications]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + take);
    }
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.notification.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
  }

  async findByRecipient(recipientId: string, pagination: PaginationDto) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      return this.mockNotifications
        .filter((n) => n.recipientId === recipientId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + take);
    }
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.notification.findMany({
      where: { recipientId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAllRead(recipientId: string) {
    if (this.useInMemoryData) {
      const unread = this.mockNotifications.filter((n) => n.recipientId === recipientId && !n.read);
      unread.forEach((n) => { n.read = true; });
      return { count: unread.length };
    }
    return this.prisma.notification.updateMany({
      where: { recipientId, read: false },
      data: { read: true },
    });
  }

  async findOne(id: string) {
    if (this.useInMemoryData) {
      return this.mockNotifications.find((n) => n.id === id) ?? null;
    }
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateNotificationDto) {
    if (this.useInMemoryData) {
      const n = this.mockNotifications.find((x) => x.id === id);
      if (n) Object.assign(n, data);
      return n ?? null;
    }
    return this.prisma.notification.update({ where: { id }, data });
  }

  async remove(id: string) {
    if (this.useInMemoryData) {
      const idx = this.mockNotifications.findIndex((n) => n.id === id);
      if (idx !== -1) this.mockNotifications.splice(idx, 1);
      return null;
    }
    return this.prisma.notification.delete({ where: { id } });
  }
}
