import { PrismaService } from '../../common/prisma/prisma.service';

export type SupervisorPerformanceReportRow = {
  supervisorId: string;
  supervisorName: string;
  supervisedProjectCount: number;
  submissionCount: number;
  averageGrade?: number;
  avgHealthScore?: number;
  riskSignalsCount: number;
};

export class SupervisorPerformanceGenerator {
  constructor(private readonly prisma: PrismaService) {}

  async generate(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
  }): Promise<{ title: string; rows: SupervisorPerformanceReportRow[] }> {
    const { scope, supervisorId, cohortId, departmentId } = params;

    const where: any = {};
    if (scope === 'SUPERVISOR' && supervisorId) where.id = supervisorId;

    if (scope === 'COHORT' && cohortId) {
      // filter via projects
      const supervisors = await this.prisma.user.findMany({
        where: {
          supervisorProfile: { isNot: null },
          supervisedProjects: { some: { cohortId } },
        },
        select: { id: true, firstName: true, lastName: true, preferredName: true },
      });

      const rows: SupervisorPerformanceReportRow[] = [];
      for (const s of supervisors) {
        rows.push(await this.buildRow(s.id));
      }
      return { title: 'Supervisor Performance Report', rows };
    }

    if (scope === 'DEPARTMENT' && departmentId) {
      const supervisors = await this.prisma.user.findMany({
        where: {
          supervisorProfile: { isNot: null },
          supervisedProjects: { some: { departmentId } },
        },
        select: { id: true, firstName: true, lastName: true, preferredName: true },
      });

      const rows: SupervisorPerformanceReportRow[] = [];
      for (const s of supervisors) {
        rows.push(await this.buildRow(s.id));
      }
      return { title: 'Supervisor Performance Report', rows };
    }

    // Default: ADMIN or SUPERVISOR
    const supervisors = await this.prisma.user.findMany({
      where: where.id
        ? {
            id: where.id,
            supervisorProfile: { isNot: null },
          }
        : {
            supervisorProfile: { isNot: null },
          },
      select: { id: true, firstName: true, lastName: true, preferredName: true },
    });

    const rows: SupervisorPerformanceReportRow[] = [];
    for (const s of supervisors) rows.push(await this.buildRow(s.id));

    return { title: 'Supervisor Performance Report', rows };
  }

  private async buildRow(supervisorId: string): Promise<SupervisorPerformanceReportRow> {
    const supervisor = await this.prisma.user.findUnique({
      where: { id: supervisorId },
      select: { id: true, preferredName: true, firstName: true, lastName: true },
    });

    const projects = await this.prisma.project.findMany({
      where: { supervisorId },
      select: { id: true },
    });
    const supervisedProjectCount = projects.length;

    const submissions = await this.prisma.submission.findMany({
      where: { projectId: { in: projects.map((p) => p.id) } },
      select: { id: true, grade: true },
    });
    const grades = submissions.map((s) => s.grade).filter((g): g is number => typeof g === 'number');
    const averageGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : undefined;

    const healthScores = await this.prisma.aIHealthScore.findMany({
      where: { projectId: { in: projects.map((p) => p.id) } },
      select: { score: true },
    });
    const avgHealthScore = healthScores.length
      ? healthScores.reduce((a: number, s: any) => a + s.score, 0) / healthScores.length
      : undefined;

    const riskSignalsCount = await this.prisma.aIRiskSignal.count({
      where: { projectId: { in: projects.map((p) => p.id) } },
    });

    return {
      supervisorId,
      supervisorName: [supervisor?.preferredName, supervisor?.firstName, supervisor?.lastName]
        .filter(Boolean)
        .join(' '),
      supervisedProjectCount,
      submissionCount: submissions.length,
      averageGrade,
      avgHealthScore,
      riskSignalsCount,
    };
  }
}

