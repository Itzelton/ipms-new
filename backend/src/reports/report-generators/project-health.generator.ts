import { PrismaService } from '../../common/prisma/prisma.service';

export type ProjectHealthReportRow = {
  projectId: string;
  projectTitle: string;
  status: string;
  healthScore?: number;
  riskCounts: { low: number; medium: number; high: number; critical: number };
  submissionCount: number;
  milestoneCompletionRatio: number;
  recommendationsCount: number;
};

export class ProjectHealthGenerator {
  constructor(private readonly prisma: PrismaService) {}

  async generate(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
  }): Promise<{ title: string; rows: ProjectHealthReportRow[] }> {
    const { scope, projectId, supervisorId, cohortId, departmentId } = params;

    const projectWhere: any = {};
    if (scope === 'PROJECT' && projectId) projectWhere.id = projectId;
    if (scope === 'SUPERVISOR' && supervisorId) projectWhere.supervisorId = supervisorId;
    if (scope === 'COHORT' && cohortId) projectWhere.cohortId = cohortId;
    if (scope === 'DEPARTMENT' && departmentId) projectWhere.departmentId = departmentId;

    const projects = await this.prisma.project.findMany({
      where: Object.keys(projectWhere).length ? projectWhere : undefined,
      include: {
        healthScores: { orderBy: { generatedAt: 'desc' }, take: 1, select: { score: true } },
        riskSignals: { select: { severity: true } },
        recommendations: { select: { id: true } },
        milestones: { select: { id: true, status: true } },
        submissions: { select: { id: true, milestoneId: true } },
      },
    });

    const rows: ProjectHealthReportRow[] = projects.map((p) => {
      const healthScore = p.healthScores[0]?.score;

      const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
      for (const r of p.riskSignals) {
        // Prisma enum values are upper-case; map defensively.
        const sev = String((r as any).severity ?? '').toUpperCase();
        if (sev === 'LOW') riskCounts.low++;
        else if (sev === 'MEDIUM') riskCounts.medium++;
        else if (sev === 'HIGH') riskCounts.high++;
        else if (sev === 'CRITICAL') riskCounts.critical++;
      }

      const totalMilestones = p.milestones.length;
      const milestonesDone = new Set(
        p.submissions.filter((s) => !!s.milestoneId).map((s) => s.milestoneId as string),
      ).size;
      const milestoneCompletionRatio = totalMilestones ? milestonesDone / totalMilestones : 0;

      return {
        projectId: p.id,
        projectTitle: p.title,
        status: p.status,
        healthScore,
        riskCounts,
        submissionCount: p.submissions.length,
        milestoneCompletionRatio,
        recommendationsCount: p.recommendations.length,
      };
    });

    return {
      title: 'Project Health Report',
      rows,
    };
  }
}

