import { AuditRepository } from './repositories/audit.repository';
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: AuditRepository);
    log(actorId: string | null | undefined, action: string, entity: string, entityId?: string, data?: any): Promise<{
        data: import("@prisma/client/runtime/library").JsonValue | null;
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        actorId: string;
    } | null>;
}
