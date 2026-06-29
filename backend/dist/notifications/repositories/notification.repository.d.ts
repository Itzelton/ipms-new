import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateNotificationDto): Promise<{
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
    update(id: string, data: UpdateNotificationDto): Promise<{
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
