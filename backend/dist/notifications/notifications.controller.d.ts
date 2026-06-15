import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(pagination: PaginationDto): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        title: string;
        link: string | null;
        recipientId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        deliveredAt: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        title: string;
        link: string | null;
        recipientId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        deliveredAt: Date | null;
    } | null>;
    create(dto: CreateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        title: string;
        link: string | null;
        recipientId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        deliveredAt: Date | null;
    }>;
    update(id: string, dto: UpdateNotificationDto): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        title: string;
        link: string | null;
        recipientId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        deliveredAt: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        projectId: string | null;
        title: string;
        link: string | null;
        recipientId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        message: string;
        read: boolean;
        deliveredAt: Date | null;
    }>;
}
