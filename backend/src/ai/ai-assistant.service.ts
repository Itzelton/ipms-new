import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatAssistantRequestDto } from './dto/chat-assistant-request.dto';
import { ChatAssistantResponseDto } from './dto/chat-assistant-response.dto';
import { AiRepository } from './repositories/ai.repository';
import { MilestoneStatus } from '@prisma/client';

type Intent =
  | 'MILESTONES_PENDING'
  | 'MILESTONES_OVERDUE'
  | 'HEALTH_SCORE'
  | 'NEXT_STEPS'
  | 'RISKS'
  | 'FORECAST'
  | 'SUPERVISOR_AT_RISK'
  | 'PROJECTS_NEED_REVIEW'
  | 'SUMMARIZE_RECENT_ACTIVITY'
  | 'UNKNOWN';

@Injectable()
export class AiAssistantService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiRepository: AiRepository,
  ) {}

  async chat(dto: ChatAssistantRequestDto): Promise<ChatAssistantResponseDto> {
    const message = (dto.message || '').toLowerCase();
    const role: 'STUDENT' | 'SUPERVISOR' = dto.roleHint || 'STUDENT';
    const intent = this.classifyIntent(message, role);
    const projectId = dto.projectId;

    if (intent === 'UNKNOWN') {
      return {
        answerText: "I can help with milestones, health scores, risks, recommendations, and forecasts. Try asking:",
        suggestedNextQuestions: [
          'What milestones are pending?',
          'What milestones are overdue?',
          'What is my health score?',
          'What are the risks on this project?',
          'What should I do next?',
          'Give me a forecast for this project',
        ],
      };
    }

    if (!projectId && role === 'STUDENT') {
      return {
        answerText: 'Select a project first so I can pull the relevant data.',
        suggestedNextQuestions: ['What milestones are pending?', 'What is my health score?'],
      };
    }

    const project = projectId
      ? await this.prisma.project.findUnique({ where: { id: projectId }, select: { id: true, title: true } })
      : null;

    const evidence: ChatAssistantResponseDto['evidence'] = [];
    const now = new Date();

    switch (intent) {
      case 'MILESTONES_PENDING': {
        const pending = await this.prisma.milestone.findMany({
          where: { projectId, status: MilestoneStatus.PENDING },
          orderBy: { dueDate: 'asc' },
        });
        pending.forEach(m => evidence.push({ type: 'MILESTONE', label: m.title, data: { dueDate: m.dueDate, status: m.status } }));
        return {
          answerText: pending.length
            ? `You have ${pending.length} pending milestone(s)${project?.title ? ` on "${project.title}"` : ''}:`
            : 'No pending milestones — great work!',
          bullets: pending.map(m => `${m.title} — due ${new Date(m.dueDate).toDateString()}`),
          evidence,
          suggestedNextQuestions: ['What milestones are overdue?', 'What should I do next?'],
        };
      }

      case 'MILESTONES_OVERDUE': {
        const overdue = await this.prisma.milestone.findMany({
          where: { projectId, status: { not: MilestoneStatus.COMPLETED }, dueDate: { lt: now } },
          orderBy: { dueDate: 'asc' },
        });
        overdue.forEach(m => evidence.push({ type: 'MILESTONE', label: m.title, data: { dueDate: m.dueDate, status: m.status } }));
        return {
          answerText: overdue.length
            ? `⚠️ ${overdue.length} overdue milestone(s)${project?.title ? ` on "${project.title}"` : ''}:`
            : '✓ No overdue milestones.',
          bullets: overdue.map(m => `${m.title} — was due ${new Date(m.dueDate).toDateString()}`),
          evidence,
          suggestedNextQuestions: ['What are the risks?', 'What should I do next?'],
        };
      }

      case 'HEALTH_SCORE': {
        let hs = await this.prisma.aIHealthScore.findFirst({ where: { projectId }, orderBy: { generatedAt: 'desc' } });
        if (!hs) hs = await this.aiRepository.generateHealthScore({ projectId, prompt: '' });
        evidence.push({ type: 'HEALTH_SCORE', label: 'Health score', data: { score: hs.score, classification: hs.classification } });
        return {
          answerText: `Health score for${project?.title ? ` "${project.title}"` : ' this project'}: ${hs.score}/100 (${hs.classification})`,
          bullets: [
            hs.score >= 80 ? '✓ Project is healthy and on track.' :
            hs.score >= 60 ? '⚠️ Project is at risk — review milestones and submissions.' :
            '🔴 Project needs urgent attention.',
          ],
          evidence,
          suggestedNextQuestions: ['What are the risks?', 'What should I do next?'],
        };
      }

      case 'RISKS': {
        let risks = await this.prisma.aIRiskSignal.findMany({ where: { projectId }, orderBy: { generatedAt: 'desc' }, take: 5 });
        if (risks.length === 0) {
          const generated = await this.aiRepository.detectRisk({ projectId, prompt: '' });
          risks = Array.isArray(generated) ? generated : [generated];
        }
        risks.forEach(r => evidence.push({ type: 'RISK_SIGNAL', label: `${r.severity} risk`, data: { description: r.description } }));
        return {
          answerText: `Risk signals for${project?.title ? ` "${project.title}"` : ' this project'}:`,
          bullets: risks.map(r => `[${r.severity}] ${r.description}`),
          evidence,
          suggestedNextQuestions: ['What should I do next?', 'Give me a forecast'],
        };
      }

      case 'NEXT_STEPS': {
        let recs = await this.prisma.aIRecommendation.findMany({ where: { projectId }, orderBy: { generatedAt: 'desc' }, take: 3 });
        if (recs.length === 0) {
          const generated = await this.aiRepository.generateRecommendation({ projectId, prompt: '' });
          recs = Array.isArray(generated) ? generated : [generated];
        }
        recs.forEach(r => evidence.push({ type: 'RECOMMENDATION', label: r.category || 'Recommendation', data: { recommendation: r.recommendation } }));
        return {
          answerText: `Recommended next steps${project?.title ? ` for "${project.title}"` : ''}:`,
          bullets: recs.map(r => r.recommendation),
          evidence,
          suggestedNextQuestions: ['What milestones are pending?', 'What is my health score?'],
        };
      }

      case 'FORECAST': {
        if (!projectId) {
          return {
            answerText: 'Select a project first so I can generate a forecast.',
            suggestedNextQuestions: ['What milestones are pending?', 'What is my health score?'],
          };
        }
        const forecast = await this.aiRepository.generateForecast(projectId, undefined);
        evidence.push({ type: 'FORECAST', label: 'Project forecast', data: { summary: forecast.summary, details: forecast.details } });
        return {
          answerText: `Forecast for${project?.title ? ` "${project.title}"` : ' this project'}:`,
          bullets: [forecast.summary],
          evidence,
          suggestedNextQuestions: ['What are the risks?', 'What should I do next?'],
        };
      }

      case 'SUMMARIZE_RECENT_ACTIVITY': {
        if (!projectId) {
          return {
            answerText: 'Select a project first so I can summarize recent activity.',
            suggestedNextQuestions: ['What milestones are pending?', 'What are the risks?'],
          };
        }
        const [milestones, submissions] = await Promise.all([
          this.prisma.milestone.findMany({ where: { projectId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
          this.prisma.submission.findMany({ where: { projectId }, orderBy: { updatedAt: 'desc' }, take: 5 }),
        ]);
        milestones.forEach(m => evidence.push({ type: 'MILESTONE', label: m.title, data: { status: m.status, updatedAt: m.updatedAt } }));
        submissions.forEach(s => evidence.push({ type: 'SUBMISSION', label: 'Submission', data: { status: s.status, updatedAt: s.updatedAt } }));
        return {
          answerText: `Recent activity${project?.title ? ` for "${project.title}"` : ''}:`,
          bullets: [
            ...milestones.map(m => `Milestone: "${m.title}" → ${m.status}`),
            ...submissions.map(s => `Submission: ${s.status} (${new Date(s.updatedAt).toDateString()})`),
          ].slice(0, 8),
          evidence,
          suggestedNextQuestions: ['What should I do next?', 'What is my health score?'],
        };
      }

      case 'SUPERVISOR_AT_RISK':
      case 'PROJECTS_NEED_REVIEW': {
        const risks = await this.prisma.aIRiskSignal.findMany({
          where: projectId ? { projectId } : {},
          orderBy: { generatedAt: 'desc' },
          take: 10,
        });
        risks.forEach(r => evidence.push({ type: 'RISK_SIGNAL', label: `${r.severity} risk`, data: { description: r.description, projectId: r.projectId } }));
        return {
          answerText: 'Projects/students flagged by risk signals:',
          bullets: risks.length ? risks.map(r => `[${r.severity}] ${r.description}`) : ['No risk signals found.'],
          evidence,
          suggestedNextQuestions: ['Summarize recent activity', 'What should be reviewed next?'],
        };
      }

      default:
        return { answerText: 'I could not determine what you are asking. Try rephrasing.' };
    }
  }

  private classifyIntent(message: string, role: 'STUDENT' | 'SUPERVISOR'): Intent {
    if (message.includes('overdue')) return 'MILESTONES_OVERDUE';
    if ((message.includes('milestone') || message.includes('task')) && (message.includes('pending') || message.includes('todo') || message.includes('not done') || message.includes('upcoming'))) return 'MILESTONES_PENDING';
    if (message.includes('health score') || message.includes('health') || message.includes('score')) return 'HEALTH_SCORE';
    if (message.includes('risk') || message.includes('danger') || message.includes('warning')) return role === 'SUPERVISOR' ? 'SUPERVISOR_AT_RISK' : 'RISKS';
    if (message.includes('forecast') || message.includes('predict') || message.includes('outlook')) return 'FORECAST';
    if (message.includes('next') || message.includes('do next') || message.includes('recommend') || message.includes('suggest')) return 'NEXT_STEPS';
    if (role === 'SUPERVISOR' && (message.includes('review') || message.includes('need attention'))) return 'PROJECTS_NEED_REVIEW';
    if (message.includes('summarize') || message.includes('recent') || message.includes('activity') || message.includes('update')) return 'SUMMARIZE_RECENT_ACTIVITY';
    return 'UNKNOWN';
  }
}
