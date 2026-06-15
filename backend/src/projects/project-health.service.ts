import { Injectable } from '@nestjs/common';
import { ProjectRepository } from './repositories/project.repository';

export type HealthCategory = 'Healthy' | 'Stable' | 'Needs Attention' | 'At Risk';

export type ProjectHealthScoreResult = {
  score: number;
  category: HealthCategory;
  color: string;
  breakdown: {
    milestoneCompletion: number;
    deadlineCompliance: number;
    submissionConsistency: number;
    supervisorEngagement: number;
    projectActivity: number;
  };
};

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ProjectRiskStatus = {
  score: number;
  level: RiskLevel;
  note: string;
  reasons: string[];
  alerts: {
    supervisor: string;
    student: string;
  };
};

export type ProjectRecommendationsResult = {
  student: string[];
  supervisor: string[];
  summary: string;
  generatedAt: Date;
};

@Injectable()
export class ProjectHealthService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async compute(projectId: string): Promise<ProjectHealthScoreResult | null> {
    const project = await this.projectRepository.findDetails(projectId);
    if (!project) return null;

    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter((milestone: any) => milestone.status === 'COMPLETED' || !!milestone.completedAt).length || 0;
    const milestoneCompletion = totalMilestones === 0 ? 0 : completedMilestones / totalMilestones;

    const now = new Date();
    const onTimeCompleted = project.milestones?.filter((milestone: any) => milestone.completedAt && new Date(milestone.completedAt) <= new Date(milestone.dueDate)).length || 0;
    const pendingNotOverdue = project.milestones?.filter((milestone: any) => !milestone.completedAt && new Date(milestone.dueDate) > now).length || 0;
    const deadlineCompliance = totalMilestones === 0 ? 0 : Math.min(1, (onTimeCompleted + pendingNotOverdue * 0.5) / totalMilestones);

    const submissionCount = project.submissions?.length || 0;
    const expectedSubmissions = Math.max(1, totalMilestones);
    const submissionConsistency = Math.min(1, submissionCount / expectedSubmissions);

    const totalDiscussionMessages = await this.projectRepository.countDiscussionMessages(projectId);
    const supervisorMessageCount = project.supervisorId
      ? await this.projectRepository.countDiscussionMessagesByAuthor(projectId, project.supervisorId)
      : 0;
    const supervisorEngagement = totalDiscussionMessages === 0 ? 0 : Math.min(1, supervisorMessageCount / totalDiscussionMessages + (supervisorMessageCount > 0 ? 0.2 : 0));

    const recentThreshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivityCount = [
      ...(project.milestones || []).filter((milestone: any) => new Date(milestone.updatedAt) >= recentThreshold),
      ...(project.submissions || []).filter((submission: any) => new Date(submission.updatedAt) >= recentThreshold),
      ...(project.discussionThreads || []).filter((thread: any) => new Date(thread.updatedAt) >= recentThreshold),
    ].length;
    const projectActivity = Math.min(1, recentActivityCount / 5);

    const score = Math.round(
      milestoneCompletion * 30 +
      deadlineCompliance * 25 +
      submissionConsistency * 20 +
      supervisorEngagement * 15 +
      projectActivity * 10,
    );

    const category = this.getCategory(score);
    const color = this.getColor(category);

    return {
      score,
      category,
      color,
      breakdown: {
        milestoneCompletion: Math.round(milestoneCompletion * 100),
        deadlineCompliance: Math.round(deadlineCompliance * 100),
        submissionConsistency: Math.round(submissionConsistency * 100),
        supervisorEngagement: Math.round(supervisorEngagement * 100),
        projectActivity: Math.round(projectActivity * 100),
      },
    };
  }

  async computeRisk(projectId: string) {
    const project = await this.projectRepository.findDetails(projectId);
    if (!project) return null;

    const now = new Date();
    const inactiveThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const totalMilestones = project.milestones?.length || 0;
    const overdueMilestones = project.milestones?.filter((milestone: any) => !milestone.completedAt && new Date(milestone.dueDate) < now).length || 0;
    const missedDeadlines = project.milestones?.filter((milestone: any) => milestone.completedAt && new Date(milestone.completedAt) > new Date(milestone.dueDate)).length || 0;
    const revisionCycles = project.submissions?.filter((submission: any) => submission.status === 'REVISION_REQUIRED').length || 0;

    const latestActivityDate = [
      ...(project.milestones || []).map((milestone: any) => new Date(milestone.updatedAt)),
      ...(project.submissions || []).map((submission: any) => new Date(submission.updatedAt)),
      ...(project.discussionThreads || []).map((thread: any) => new Date(thread.updatedAt)),
    ].reduce((latest: Date | null, current: Date) => {
      if (!latest) return current;
      return current > latest ? current : latest;
    }, null as Date | null);

    const noActivityRisk = latestActivityDate && latestActivityDate < inactiveThreshold ? 25 : (latestActivityDate ? 0 : 15);
    const communicationCount = await this.projectRepository.countDiscussionMessages(projectId);
    const supervisorMessageCount = project.supervisorId
      ? await this.projectRepository.countDiscussionMessagesByAuthor(projectId, project.supervisorId)
      : 0;
    const communicationRisk = communicationCount === 0
      ? 20
      : (supervisorMessageCount / communicationCount < 0.2 ? 15 : 0);

    const revisionRisk = Math.min(20, revisionCycles * 8);
    const deadlineRisk = totalMilestones === 0 ? 0 : Math.min(25, ((overdueMilestones + missedDeadlines) / totalMilestones) * 25);
    const delayedCompletionRisk = overdueMilestones > 0 ? 20 : 0;

    const riskScore = Math.min(100, Math.round(noActivityRisk + communicationRisk + revisionRisk + deadlineRisk + delayedCompletionRisk));
    const riskLevel = this.getRiskLevel(riskScore);

    const riskReasons = [] as string[];
    if (noActivityRisk > 0) riskReasons.push('No activity in the last 14 days.');
    if (overdueMilestones > 0) riskReasons.push(`${overdueMilestones} overdue milestone${overdueMilestones === 1 ? '' : 's'}.`);
    if (missedDeadlines > 0) riskReasons.push(`${missedDeadlines} milestone${missedDeadlines === 1 ? '' : 's'} missed its deadline.`);
    if (revisionCycles > 0) riskReasons.push(`${revisionCycles} revision-requested submission${revisionCycles === 1 ? '' : 's'}.`);
    if (communicationRisk > 0) riskReasons.push('Discussion and supervisor engagement are low.');
    if (riskReasons.length === 0) riskReasons.push('Project activity and milestone progress are steady.');

    const summary = riskReasons.length > 1
      ? `${riskReasons[0]} ${riskReasons[1]}`
      : riskReasons[0];

    return {
      score: riskScore,
      level: riskLevel,
      note: riskLevel === 'Low'
        ? 'Project risk is low, but continue monitoring milestone delivery and collaboration.'
        : `Project risk is ${riskLevel.toLowerCase()}. ${summary}`,
      reasons: riskReasons,
      alerts: {
        supervisor: `Supervisor alert: ${project.title} is ${riskLevel.toLowerCase()} risk. ${riskReasons[0]}`,
        student: `Student alert: your project is ${riskLevel.toLowerCase()} risk. ${riskReasons[0]}`,
      },
    };
  }

  async computeRecommendations(projectId: string): Promise<ProjectRecommendationsResult | null> {
    const project = await this.projectRepository.findDetails(projectId);
    if (!project) return null;

    const now = new Date();
    const upcomingDeadlineWindow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inactiveThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const totalMilestones = project.milestones?.length || 0;
    const incompleteMilestones = (project.milestones || []).filter((milestone: any) => milestone.status !== 'COMPLETED');
    const upcomingDeadlines = incompleteMilestones.filter((milestone: any) => new Date(milestone.dueDate) <= upcomingDeadlineWindow);
    const overdueMilestones = incompleteMilestones.filter((milestone: any) => new Date(milestone.dueDate) < now);
    const pendingReviews = (project.submissions || []).filter((submission: any) => submission.status === 'UNDER_REVIEW' || submission.status === 'REVISION_REQUIRED');

    const latestSubmission = (project.submissions || [])
      .map((submission: any) => new Date(submission.updatedAt))
      .sort((a: Date, b: Date) => Number(b) - Number(a))[0];

    const latestActivityDate = [
      ...(project.milestones || []).map((milestone: any) => new Date(milestone.updatedAt)),
      ...(project.submissions || []).map((submission: any) => new Date(submission.updatedAt)),
      ...(project.discussionThreads || []).map((thread: any) => new Date(thread.updatedAt)),
    ].reduce((latest: Date | null, current: Date) => {
      if (!latest) return current;
      return current > latest ? current : latest;
    }, null as Date | null);

    const communicationCount = await this.projectRepository.countDiscussionMessages(projectId);
    const supervisorMessageCount = project.supervisorId
      ? await this.projectRepository.countDiscussionMessagesByAuthor(projectId, project.supervisorId)
      : 0;
    const communicationRatio = communicationCount === 0 ? 0 : supervisorMessageCount / communicationCount;
    const communicationIssue = communicationCount === 0 || communicationRatio < 0.2;

    const riskStatus = await this.computeRisk(projectId);

    const studentRecommendations: string[] = [];
    const supervisorRecommendations: string[] = [];

    if (overdueMilestones.length > 0) {
      studentRecommendations.push(
        `Resolve ${overdueMilestones.length} overdue milestone${overdueMilestones.length === 1 ? '' : 's'} as soon as possible.`,
      );
      supervisorRecommendations.push(
        `Discuss progress on ${overdueMilestones.length} overdue milestone${overdueMilestones.length === 1 ? '' : 's'} with the student.`,
      );
    }

    if (upcomingDeadlines.length > 0) {
      studentRecommendations.push(
        `Prepare for ${upcomingDeadlines.length} upcoming deadline${upcomingDeadlines.length === 1 ? '' : 's'} in the next 7 days.`,
      );
      supervisorRecommendations.push(
        `Check in on ${upcomingDeadlines.length} milestone${upcomingDeadlines.length === 1 ? '' : 's'} due soon.`,
      );
    }

    if (pendingReviews.length > 0) {
      const reviewCount = pendingReviews.length;
      studentRecommendations.push(
        `Review feedback and resubmit ${reviewCount} submission${reviewCount === 1 ? '' : 's'} if required.`,
      );
      supervisorRecommendations.push(
        `Approve or provide feedback for ${reviewCount} pending review${reviewCount === 1 ? '' : 's'}.`,
      );
    }

    if (!latestActivityDate || latestActivityDate < inactiveThreshold) {
      studentRecommendations.push('Post a project update or activity note to re-engage your supervisor.');
      supervisorRecommendations.push('Prompt the student for a status update to reduce inactivity risk.');
    }

    if (communicationIssue) {
      studentRecommendations.push('Share your current progress in the discussion thread so your supervisor can provide guidance.');
      supervisorRecommendations.push('Increase discussion feedback and encourage the student to collaborate more frequently.');
    }

    if (latestSubmission && now.getTime() - latestSubmission.getTime() > 14 * 24 * 60 * 60 * 1000) {
      studentRecommendations.push('Submit a progress report or evidence item to keep your project on track.');
    }

    if (totalMilestones > 0 && (project.submissions?.length || 0) < Math.max(1, totalMilestones)) {
      studentRecommendations.push('Submit the next required deliverable to maintain momentum toward milestone completion.');
    }

    if (riskStatus && (riskStatus.level === 'High' || riskStatus.level === 'Critical')) {
      supervisorRecommendations.push(`Prioritize support for this at-risk student: risk is currently ${riskStatus.level}.`);
      studentRecommendations.push('Address the highest risk items first and share your recovery plan with the supervisor.');
    }

    if (studentRecommendations.length === 0) {
      studentRecommendations.push('Continue steady progress on the next milestone and keep your supervisor updated.');
    }
    if (supervisorRecommendations.length === 0) {
      supervisorRecommendations.push('Monitor project progress and review pending work as students complete milestones.');
    }

    const summary = [
      ...studentRecommendations.slice(0, 2),
      ...supervisorRecommendations.slice(0, 2),
    ].join(' ');

    return {
      student: studentRecommendations,
      supervisor: supervisorRecommendations,
      summary,
      generatedAt: new Date(),
    };
  }

  private getCategory(score: number): HealthCategory {
    if (score >= 85) return 'Healthy';
    if (score >= 70) return 'Stable';
    if (score >= 50) return 'Needs Attention';
    return 'At Risk';
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 35) return 'Medium';
    return 'Low';
  }

  private getColor(category: HealthCategory): string {
    switch (category) {
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-800';
      case 'Stable':
        return 'bg-yellow-100 text-yellow-800';
      case 'Needs Attention':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  }
}
