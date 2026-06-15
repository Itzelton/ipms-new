import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMilestoneDto } from '../dto/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/update-milestone.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class MilestoneRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMilestoneDto) {
    return this.prisma.milestone.create({ data });
  }

  async findAll(pagination: PaginationDto) {
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.milestone.findMany({ skip, take });
  }

  async findOne(id: string) {
    return this.prisma.milestone.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateMilestoneDto) {
    return this.prisma.milestone.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.milestone.delete({ where: { id } });
  }
}
