import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class NotificationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateNotificationDto): Promise<{
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
    update(id: string, data: UpdateNotificationDto): Promise<{
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
