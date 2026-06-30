import { PrismaService } from '../../common/prisma/prisma.service';

export type StudentProgressReportRow = {
  studentId: string;
  studentName: string;
  projectId: string;
  projectTitle: string;
  submissionCount: number;
  submittedMilestones: number;
  totalMilestones: number;
  completionRatio: number;
  averageGrade?: number;
};

export class StudentProgressGenerator {
  constructor(private readonly prisma: PrismaService) {}

  async generate(params: {
    scope: 'PROJECT' | 'SUPERVISOR' | 'COHORT' | 'DEPARTMENT' | 'ADMIN';
    projectId?: string;
    supervisorId?: string;
    cohortId?: string;
    departmentId?: string;
    dateRange?: string;
  }): Promise<{ title: string; rows: StudentProgressReportRow[] }> {
    const { scope, projectId, supervisorId, cohortId, departmentId } = params;

    // Scope mapping: we only implement the most common selectors based on schema relations.
    const projectWhere: any = {};
    if (scope === 'PROJECT' && projectId) projectWhere.id = projectId;
    if (scope === 'SUPERVISOR' && supervisorId) projectWhere.supervisorId = supervisorId;
    if (scope === 'COHORT' && cohortId) projectWhere.cohortId = cohortId;
    if (scope === 'DEPARTMENT' && departmentId) projectWhere.departmentId = departmentId;

    // Pull projects with studentId and milestone/submission stats.
    const projects = await this.prisma.project.findMany({
      where: Object.keys(projectWhere).length ? projectWhere : undefined,
      include: {
        student: { select: { id: true, preferredName: true, firstName: true, lastName: true } },
        milestones: { select: { id: true, status: true } },
        submissions: {
          select: {
            id: true,
            authorId: true,
            grade: true,
            milestoneId: true,
          },
        },
      },
    });

    const rows: StudentProgressReportRow[] = [];

    for (const p of projects) {
      const studentId = p.studentId;
      if (!studentId) continue;

      const studentName = [p.student?.preferredName, p.student?.firstName, p.student?.lastName]
        .filter(Boolean)
        .join(' ');

      const allMilestones = p.milestones.length;
      const submittedMilestones = new Set(
        p.submissions.filter((s) => !!s.milestoneId).map((s) => s.milestoneId as string),
      ).size;

      const completionRatio = allMilestones ? submittedMilestones / allMilestones : 0;

      const grades = p.submissions.map((s) => s.grade).filter((g): g is number => typeof g === 'number');
      const averageGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : undefined;

      rows.push({
        studentId,
        studentName,
        projectId: p.id,
        projectTitle: p.title,
        submissionCount: p.submissions.length,
        submittedMilestones,
        totalMilestones: allMilestones,
        completionRatio,
        averageGrade,
      });
    }

    return {
      title: 'Student Progress Report',
      rows,
    };
  }
}

