import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ProjectStatus, ProjectType, RoleName } from '@prisma/client';

@Injectable()
export class ProjectRepository {
  private readonly useInMemoryData = !process.env.DATABASE_URL;
  private readonly mockProjects: any[] = [
    {
      id: randomUUID(),
      title: 'Project Alpha',
      description: 'A capstone project focused on a real-world problem.',
      status: ProjectStatus.ACTIVE,
      type: ProjectType.CAPSTONE,
      student: {
        id: randomUUID(),
        email: 'student@example.com',
        firstName: 'Student',
        lastName: 'Example',
      },
      supervisor: {
        id: randomUUID(),
        email: 'supervisor@example.com',
        firstName: 'Supervisor',
        lastName: 'Example',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: randomUUID(),
      title: 'Research Insight',
      description: 'A research-oriented project that explores a new approach.',
      status: ProjectStatus.PROPOSED,
      type: ProjectType.RESEARCH,
      student: {
        id: randomUUID(),
        email: 'researcher@example.com',
        firstName: 'Researcher',
        lastName: 'Example',
      },
      supervisor: {
        id: randomUUID(),
        email: 'advisor@example.com',
        firstName: 'Advisor',
        lastName: 'Example',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

  async findAll(pagination: PaginationDto) {
    if (this.useInMemoryData) {
      const take = pagination.limit || 20;
      const skip = pagination.page ? (pagination.page - 1) * take : 0;
      return this.mockProjects.slice(skip, skip + take);
    }

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
