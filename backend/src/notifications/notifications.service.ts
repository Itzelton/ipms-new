import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(pagination: PaginationDto) {
    return this.notificationRepository.findAll(pagination);
  }

  async findOne(id: string) {
    return this.notificationRepository.findOne(id);
  }

  async create(dto: CreateNotificationDto) {
    const created = await this.notificationRepository.create({
      ...dto,
      type: dto.type ?? 'SYSTEM',
      title: dto.title ?? 'Notification',
      projectId: (dto as any).projectId ?? undefined,
    } as any);

    this.notificationsGateway.emitNew({
      ...created,
      createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : created.createdAt,
    });

    return created;
  }


  async update(id: string, dto: UpdateNotificationDto) {
    const updated = await this.notificationRepository.update(id, dto);

    this.notificationsGateway.emitUpdated({
      ...updated,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
    });

    return updated;
  }


  async remove(id: string) {
    return this.notificationRepository.remove(id);
  }
}

