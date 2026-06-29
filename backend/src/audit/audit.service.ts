import { Injectable } from '@nestjs/common';
import { AuditRepository } from './repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(actorId: string | null | undefined, action: string, entity: string, entityId?: string, data?: any) {
    if (!actorId) {
      console.log(`[Audit Log] (No Actor) Action: ${action}, Entity: ${entity}, ID: ${entityId}`);
      return null;
    }
    return this.auditRepo.create({ actorId, action, entity, entityId, data });
  }
}
