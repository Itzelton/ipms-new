import { Injectable } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProjectInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, role: RoleName, createdById: string, expiresAt?: Date) {
    return this.prisma.projectInvite.create({
      data: { projectId, role, createdById, expiresAt },
    });
  }

  async findByToken(token: string) {
    return this.prisma.projectInvite.findUnique({
      where: { token },
      include: {
        project: { select: { id: true, title: true } },
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.projectInvite.findMany({
      where: { projectId },
      include: {
        createdBy: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementUsedCount(token: string) {
    return this.prisma.projectInvite.update({
      where: { token },
      data: { usedCount: { increment: 1 } },
    });
  }

  async revoke(token: string) {
    return this.prisma.projectInvite.delete({ where: { token } });
  }
}
