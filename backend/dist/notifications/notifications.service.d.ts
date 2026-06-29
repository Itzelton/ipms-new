import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationsGateway } from './notifications.gateway';
export declare class NotificationsService {
    private readonly notificationRepository;
    private readonly notificationsGateway;
    constructor(notificationRepository: NotificationRepository, notificationsGateway: NotificationsGateway);
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        link: string | null;
        read: boolean;
        createdAt: Date;
        deliveredAt: Date | null;
        recipientId: string;
        projectId: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        link: string | null;
        read: boolean;
        createdAt: Date;
        deliveredAt: Date | null;
        recipientId: string;
        projectId: string | null;
    } | null>;
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        link: string | null;
        read: boolean;
        createdAt: Date;
        deliveredAt: Date | null;
        recipientId: string;
        projectId: string | null;
    }>;
    update(id: string, dto: UpdateNotificationDto): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        link: string | null;
        read: boolean;
        createdAt: Date;
        deliveredAt: Date | null;
        recipientId: string;
        projectId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        message: string;
        link: string | null;
        read: boolean;
        createdAt: Date;
        deliveredAt: Date | null;
        recipientId: string;
        projectId: string | null;
    }>;
}
