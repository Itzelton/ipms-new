import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProjectStatus, ProjectType, RoleName } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectDto) {
    return this.prisma.project.create({ data });
  }

  async findAll(pagination: PaginationDto) {
    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    return this.prisma.project.findMany({
      skip,
      take,
      include: {
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findDetails(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        student: true,
        supervisor: true,
        department: true,
        cohort: true,
        assignments: {
          include: { user: true },
        },
        milestones: true,
        submissions: true,
        discussionThreads: true,
        notifications: true,
        analytics: true,
        healthScores: true,
        riskSignals: true,
        recommendations: true,
        forecasts: true,
        reports: true,
      },
    });
  }

  async countDiscussionMessages(projectId: string) {
    return this.prisma.discussionMessage.count({
      where: {
        thread: {
          projectId,
        },
      },
    });
  }

  async countDiscussionMessagesByAuthor(projectId: string, authorId: string) {
    return this.prisma.discussionMessage.count({
      where: {
        authorId,
        thread: {
          projectId,
        },
      },
    });
  }

  async update(id: string, data: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async assignSupervisor(id: string, supervisorId: string) {
    return this.prisma.project.update({
      where: { id },
      data: {
        supervisorId,
        assignments: {
          create: {
            userId: supervisorId,
            role: RoleName.SUPERVISOR,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: ProjectStatus) {
    return this.prisma.project.update({ where: { id }, data: { status } });
  }

  async updateType(id: string, type: ProjectType) {
    return this.prisma.project.update({ where: { id }, data: { type } });
  }

  async remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
