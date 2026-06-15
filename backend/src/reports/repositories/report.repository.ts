import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(scope?: string) {
    return this.prisma.report.findMany({
      where: scope ? { scope } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.report.findUnique({ where: { id } });
  }

  async create(data: { title: string; description?: string; generatedById: string; scope?: string }) {
    return this.prisma.report.create({ data });
  }

  async remove(id: string) {
    return this.prisma.report.delete({ where: { id } });
  }
}
