import { Injectable } from '@nestjs/common';
import { AuditRepository } from './repositories/audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  async log(actorId: string, action: string, entity: string, entityId?: string, data?: any) {
    return this.auditRepo.create({ actorId, action, entity, entityId, data });
  }
}
