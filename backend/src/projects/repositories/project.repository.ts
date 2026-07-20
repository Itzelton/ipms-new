import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProjectStatus, ProjectType, RoleName } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  private get useInMemoryData() { return !this.prisma.isConnected; }
  private readonly mockProjects: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectDto) {
    if (this.useInMemoryData) {
      const project = {
        id: randomUUID(),
        ...data,
        status: data.status || ProjectStatus.PROPOSED,
        type: data.type || ProjectType.OTHER,
        student: null,
        supervisor: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
      this.mockProjects.push(project);
      return project;
    }

    return this.prisma.project.create({ data });
  }

  async findAll(pagination: PaginationDto, userId?: string) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      return this.mockProjects.slice(skip, skip + take);
    }

    const take = pagination.limit || 20;
    const skip = pagination.page ? (pagination.page - 1) * take : 0;
    const where = userId
      ? { OR: [{ studentId: userId }, { supervisorId: userId }, { assignments: { some: { userId } } }] }
      : {};
    return this.prisma.project.findMany({
      skip,
      take,
      where,
      include: {
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
        assignments: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async findOne(id: string) {
    if (this.useInMemoryData) {
      return this.mockProjects.find((project) => project.id === id) as any;
    }

    return this.prisma.project.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, email: true, firstName: true, lastName: true } },
        supervisor: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
  }

  async findDetails(id: string) {
    if (this.useInMemoryData) {
      const project = this.mockProjects.find((item) => item.id === id);
      if (!project) {
        return null;
      }
      return {
        ...project,
        department: null,
        cohort: null,
        assignments: [],
        milestones: [],
        submissions: [],
        discussionThreads: [],
        notifications: [],
        analytics: [],
        healthScores: [],
        riskSignals: [],
        recommendations: [],
        forecasts: [],
        reports: [],
      } as any;
    }

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
    if (this.useInMemoryData) {
      return 0;
    }

    return this.prisma.discussionMessage.count({
      where: {
        thread: {
          projectId,
        },
      },
    });
  }

  async countDiscussionMessagesByAuthor(projectId: string, authorId: string) {
    if (this.useInMemoryData) {
      return 0;
    }

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
    if (this.useInMemoryData) {
      const project = this.mockProjects.find((item) => item.id === id);
      if (!project) {
        return null;
      }
      Object.assign(project, data, { updatedAt: new Date() });
      return project as any;
    }

    return this.prisma.project.update({ where: { id }, data });
  }

  async assignSupervisor(id: string, supervisorId: string) {
    if (this.useInMemoryData) {
      const project = this.mockProjects.find((item) => item.id === id);
      if (!project) {
        return null;
      }
      project.supervisor = {
        id: supervisorId,
        email: `supervisor+${supervisorId}@example.com`,
        firstName: 'Supervisor',
        lastName: 'Assigned',
      };
      return project as any;
    }

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
    if (this.useInMemoryData) {
      const project = this.mockProjects.find((item) => item.id === id);
      if (!project) {
        return null;
      }
      project.status = status;
      project.updatedAt = new Date();
      return project as any;
    }

    return this.prisma.project.update({ where: { id }, data: { status } });
  }

  async updateType(id: string, type: ProjectType) {
    if (this.useInMemoryData) {
      const project = this.mockProjects.find((item) => item.id === id);
      if (!project) {
        return null;
      }
      project.type = type;
      project.updatedAt = new Date();
      return project as any;
    }

    return this.prisma.project.update({ where: { id }, data: { type } });
  }

  async findCollaborators(projectId: string) {
    if (this.useInMemoryData) return [];
    return this.prisma.projectAssignment.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }

  async addCollaborator(projectId: string, userId: string, role: RoleName = RoleName.REVIEWER) {
    if (this.useInMemoryData) {
      return { id: randomUUID(), projectId, userId, role, assignedAt: new Date() };
    }
    return this.prisma.projectAssignment.upsert({
      where: { projectId_userId_role: { projectId, userId, role } },
      create: { projectId, userId, role },
      update: {},
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    });
  }

  async removeCollaborator(projectId: string, userId: string) {
    if (this.useInMemoryData) return null;
    return this.prisma.projectAssignment.deleteMany({ where: { projectId, userId } });
  }

  async findProposalsForSupervisor(supervisorId: string) {
    if (this.useInMemoryData) {
      return this.mockProjects.filter((p) => p.supervisorId === supervisorId || p.supervisor?.id === supervisorId);
    }
    return this.prisma.project.findMany({
      where: { supervisorId, status: ProjectStatus.PROPOSED },
      include: {
        student: { select: { id: true, email: true, firstName: true, lastName: true, preferredName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string) {
    if (this.useInMemoryData) {
      const index = this.mockProjects.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }
      const [removed] = this.mockProjects.splice(index, 1);
      return removed as any;
    }

    return this.prisma.project.delete({ where: { id } });
  }
}
