import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AiRequestDto } from '../dto/ai-request.dto';
import { RiskSeverity, ForecastHorizon, MilestoneStatus, SubmissionStatus } from '@prisma/client';

@Injectable()
export class AiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async generateHealthScore(dto: AiRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: {
        milestones: true,
        submissions: true,
      },
    });

    if (!project) {
      return this.prisma.aIHealthScore.create({
        data: { projectId: dto.projectId, score: 50, classification: 'UNKNOWN', source: 'computed' },
      });
    }

    const milestones = project.milestones;
    const submissions = project.submissions;
    const now = new Date();

    // Milestone completion ratio (40 points)
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
    const milestoneScore = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 40 : 20;

    // Overdue milestones penalty
    const overdueMilestones = milestones.filter(
      m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now,
    ).length;
    const overduePenalty = Math.min(overdueMilestones * 10, 30);

    // Submission activity (30 points)
    const recentSubmissions = submissions.filter(s => {
      const daysAgo = (now.getTime() - new Date(s.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }).length;
    const submissionScore = Math.min(recentSubmissions * 10, 30);

    // Approved submissions bonus (30 points)
    const approvedSubmissions = submissions.filter(s => s.status === SubmissionStatus.APPROVED).length;
    const approvalScore = Math.min(approvedSubmissions * 15, 30);

    const raw = milestoneScore + submissionScore + approvalScore - overduePenalty;
    const score = Math.max(0, Math.min(100, Math.round(raw)));

    const classification =
      score >= 80 ? 'HEALTHY' :
      score >= 60 ? 'AT_RISK' :
      score >= 40 ? 'NEEDS_ATTENTION' : 'CRITICAL';

    return this.prisma.aIHealthScore.create({
      data: { projectId: dto.projectId, score, classification, source: 'computed' },
    });
  }

  async detectRisk(dto: AiRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { milestones: true, submissions: true },
    });

    const now = new Date();
    const risks: { severity: RiskSeverity; description: string }[] = [];

    if (project) {
      const overdue = project.milestones.filter(
        m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now,
      );
      if (overdue.length > 0) {
        risks.push({
          severity: overdue.length >= 3 ? RiskSeverity.CRITICAL : RiskSeverity.HIGH,
          description: `${overdue.length} overdue milestone(s): ${overdue.map(m => m.title).join(', ')}`,
        });
      }

      const daysSinceSubmission = project.submissions.length > 0
        ? (now.getTime() - new Date(project.submissions[project.submissions.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24)
        : 999;

      if (daysSinceSubmission > 14) {
        risks.push({
          severity: daysSinceSubmission > 30 ? RiskSeverity.HIGH : RiskSeverity.MEDIUM,
          description: `No submission activity in ${Math.round(daysSinceSubmission)} days`,
        });
      }

      const blockedMilestones = project.milestones.filter(m => m.status === MilestoneStatus.BLOCKED);
      if (blockedMilestones.length > 0) {
        risks.push({
          severity: RiskSeverity.HIGH,
          description: `${blockedMilestones.length} milestone(s) are blocked: ${blockedMilestones.map(m => m.title).join(', ')}`,
        });
      }
    }

    if (risks.length === 0) {
      risks.push({ severity: RiskSeverity.LOW, description: 'No significant risks detected at this time' });
    }

    const created = await Promise.all(
      risks.map(r =>
        this.prisma.aIRiskSignal.create({
          data: { projectId: dto.projectId, severity: r.severity, description: r.description, source: 'computed' },
        }),
      ),
    );

    return created;
  }

  async generateRecommendation(dto: AiRequestDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { milestones: true, submissions: true },
    });

    const now = new Date();
    const recommendations: { recommendation: string; category: string }[] = [];

    if (project) {
      const pendingMilestones = project.milestones.filter(m => m.status === MilestoneStatus.PENDING);
      const overdue = project.milestones.filter(
        m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now,
      );

      if (overdue.length > 0) {
        recommendations.push({
          category: 'MILESTONE',
          recommendation: `Address ${overdue.length} overdue milestone(s) immediately. Prioritise: "${overdue[0].title}"`,
        });
      }

      if (pendingMilestones.length > 0) {
        const next = pendingMilestones.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
        recommendations.push({
          category: 'PLANNING',
          recommendation: `Next milestone due: "${next.title}" on ${new Date(next.dueDate).toDateString()}. Start preparing now.`,
        });
      }

      if (project.submissions.length === 0) {
        recommendations.push({
          category: 'SUBMISSION',
          recommendation: 'No submissions recorded yet. Submit your first progress report to your supervisor.',
        });
      } else {
        const lastSubmission = project.submissions[project.submissions.length - 1];
        const daysAgo = (now.getTime() - new Date(lastSubmission.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysAgo > 14) {
          recommendations.push({
            category: 'SUBMISSION',
            recommendation: `Last submission was ${Math.round(daysAgo)} days ago. Regular submissions keep supervisors informed.`,
          });
        }
      }
    }

    if (recommendations.length === 0) {
      recommendations.push({
        category: 'GENERAL',
        recommendation: 'Project is progressing well. Maintain regular submissions and milestone updates.',
      });
    }

    const created = await Promise.all(
      recommendations.map(r =>
        this.prisma.aIRecommendation.create({
          data: { projectId: dto.projectId, recommendation: r.recommendation, category: r.category, source: 'computed' },
        }),
      ),
    );

    return created;
  }

  async generateForecast(projectId: string, horizon?: ForecastHorizon) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { milestones: true, submissions: true },
    });

    const now = new Date();
    let summary = '';
    let details: Record<string, unknown> = {};

    if (project) {
      const total = project.milestones.length;
      const completed = project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
      const overdue = project.milestones.filter(
        m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now,
      ).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      if (horizon === ForecastHorizon.SHORT_TERM) {
        summary = overdue > 0
          ? `Short-term outlook is at risk. ${overdue} milestone(s) are overdue and need immediate attention.`
          : `Short-term outlook is stable. ${completed}/${total} milestones completed (${completionRate}%).`;
      } else if (horizon === ForecastHorizon.MEDIUM_TERM) {
        summary = completionRate >= 50
          ? `Medium-term outlook is positive. Project is ${completionRate}% through milestones with adequate momentum.`
          : `Medium-term outlook needs monitoring. Only ${completionRate}% of milestones completed — pace may need to increase.`;
      } else {
        summary = completionRate >= 70
          ? `Long-term forecast is on track for successful completion.`
          : `Long-term forecast shows risk of delay. Current completion rate of ${completionRate}% suggests timeline pressure ahead.`;
      }

      details = { completionRate, totalMilestones: total, completedMilestones: completed, overdueMilestones: overdue, totalSubmissions: project.submissions.length };
    } else {
      summary = 'Insufficient data to generate a forecast.';
    }

    return this.prisma.forecast.create({
      data: {
        projectId,
        horizon: horizon || ForecastHorizon.SHORT_TERM,
        summary,
        details,
      },
    });
  }
}
