import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNotificationDto) {
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
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.notification.findMany({ skip, take });
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateNotificationDto) {
    return this.prisma.notification.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
