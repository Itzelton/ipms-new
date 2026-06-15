import { PrismaService } from '../../common/prisma/prisma.service';
export declare class AuditRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create({ actorId, action, entity, entityId, data }: {
        actorId: string;
        action: string;
        entity: string;
        entityId?: string;
        data?: any;
    }): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        actorId: string;
    }>;
    findRecent(limit?: number): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        actorId: string;
    }[]>;
}
