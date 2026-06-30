import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ actorId, action, entity, entityId, data }: { actorId: string; action: string; entity: string; entityId?: string; data?: any }) {
    return this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entity,
        entityId,
        data,
      },
    });
  }

  async findRecent(limit = 50) {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: limit });
  }
}
