import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ChatAssistantRequestDto, HistoryMessage } from './dto/chat-assistant-request.dto';
import { ChatAssistantResponseDto } from './dto/chat-assistant-response.dto';
import { OpenRouterService } from './openrouter.service';
import { MilestoneStatus } from '@prisma/client';

const MAX_HISTORY = 8;

@Injectable()
export class AiAssistantService {
  private readonly useDb = !!process.env.DATABASE_URL;

  constructor(
    private readonly prisma: PrismaService,
    private readonly openRouter: OpenRouterService,
  ) {}

  async chat(dto: ChatAssistantRequestDto): Promise<ChatAssistantResponseDto> {
    const role: 'STUDENT' | 'SUPERVISOR' = dto.roleHint ?? 'STUDENT';
    const projectId = dto.projectId;
    const contextParts: string[] = [];

    // Use frontend-passed context first (avoids extra DB round-trip)
    if (dto.projectContext && (dto.projectContext.milestones || dto.projectContext.submissions)) {
      this.buildContextFromFrontend(dto.projectContext, contextParts);
    } else if (this.useDb) {
      try {
        if (projectId) {
          await this.gatherProjectContext(projectId, contextParts);
        } else if (role === 'SUPERVISOR') {
          await this.gatherSupervisorContext(contextParts);
        } else if (dto.userId) {
          await this.gatherStudentContext(dto.userId, contextParts);
        }
      } catch {
        // DB unavailable — proceed without context
      }
    }

    const systemPrompt = buildSystemPrompt(role, contextParts);

    // Build conversation messages: history (capped) + current
    const prior: HistoryMessage[] = (dto.history ?? []).slice(-MAX_HISTORY);
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...prior,
      { role: 'user', content: dto.message },
    ];

    try {
      const answerText = await this.openRouter.chat(systemPrompt, messages);
      return {
        answerText,
        suggestedNextQuestions: this.suggestQuestions(role, !!projectId || !!dto.projectContext),
      };
    } catch {
      return {
        answerText: `I'm having trouble reaching the AI service right now. Please try again in a moment.`,
        suggestedNextQuestions: this.suggestQuestions(role, !!projectId || !!dto.projectContext),
      };
    }
  }

  private buildContextFromFrontend(
    ctx: NonNullable<ChatAssistantRequestDto['projectContext']>,
    out: string[],
  ) {
    if (ctx.title) out.push(`Project: "${ctx.title}" (status: ${ctx.status ?? 'unknown'})`);

    const milestones = ctx.milestones ?? [];
    if (milestones.length > 0) {
      const now = new Date();
      const completed = milestones.filter(m => m.status === 'COMPLETED');
      const pending = milestones.filter(m => m.status === 'PENDING');
      const overdue = milestones.filter(
        m => m.status !== 'COMPLETED' && new Date(m.dueDate) < now,
      );

      out.push(
        `Milestones (${milestones.length} total): ${completed.length} completed, ${pending.length} pending, ${overdue.length} overdue`,
      );

      if (overdue.length > 0) {
        out.push(
          `Overdue milestones: ${overdue.map(m => `"${m.title}" (was due ${new Date(m.dueDate).toDateString()})`).join(', ')}`,
        );
      }

      const allMilestoneNames = milestones.map(m => `"${m.title}" [${m.status}, due ${new Date(m.dueDate).toDateString()}]`).join('; ');
      out.push(`All milestones: ${allMilestoneNames}`);

      const next = pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      if (next) out.push(`Next upcoming milestone: "${next.title}" due ${new Date(next.dueDate).toDateString()}`);
    }

    const submissions = ctx.submissions ?? [];
    if (submissions.length === 0) {
      out.push('Submissions: none yet');
    } else {
      const now = new Date();
      const last = submissions[submissions.length - 1];
      const daysSince = Math.round(
        (now.getTime() - new Date(last.createdAt).getTime()) / 86_400_000,
      );
      const names = submissions.map(s => `"${s.title ?? 'Untitled'}" [${s.status}]`).join(', ');
      out.push(`Submissions (${submissions.length}): ${names}`);
      out.push(`Last submission: ${daysSince} day(s) ago (status: ${last.status})`);
    }

    if (ctx.healthScore) {
      out.push(`Health score: ${ctx.healthScore.score}/100 (${ctx.healthScore.classification})`);
    }
  }

  private async gatherProjectContext(projectId: string, out: string[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        submissions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!project) return;

    const now = new Date();
    const completed = project.milestones.filter(m => m.status === MilestoneStatus.COMPLETED);
    const pending = project.milestones.filter(m => m.status === MilestoneStatus.PENDING);
    const overdue = project.milestones.filter(
      m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now,
    );

    out.push(`Project: "${project.title}" (status: ${project.status})`);
    out.push(
      `Milestones (${project.milestones.length} total): ${completed.length} completed, ${pending.length} pending, ${overdue.length} overdue`,
    );

    if (overdue.length > 0) {
      out.push(
        `Overdue milestones: ${overdue.map(m => `"${m.title}" (was due ${new Date(m.dueDate).toDateString()})`).join(', ')}`,
      );
    }

    const allMilestoneNames = project.milestones.map(m => `"${m.title}" [${m.status}, due ${new Date(m.dueDate).toDateString()}]`).join('; ');
    out.push(`All milestones: ${allMilestoneNames}`);

    const next = pending[0];
    if (next) out.push(`Next milestone: "${next.title}" due ${new Date(next.dueDate).toDateString()}`);

    if (project.submissions.length === 0) {
      out.push('Submissions: none yet');
    } else {
      const daysSince = Math.round(
        (now.getTime() - new Date(project.submissions[0].createdAt).getTime()) / 86_400_000,
      );
      out.push(
        `Submissions: ${project.submissions.length} total, last ${daysSince} day(s) ago (status: ${project.submissions[0].status})`,
      );
    }

    const hs = await this.prisma.aIHealthScore.findFirst({
      where: { projectId },
      orderBy: { generatedAt: 'desc' },
    });
    if (hs) out.push(`Health score: ${hs.score}/100 (${hs.classification})`);

    const risks = await this.prisma.aIRiskSignal.findMany({
      where: { projectId },
      orderBy: { generatedAt: 'desc' },
      take: 3,
    });
    if (risks.length > 0) {
      out.push(`Risks: ${risks.map(r => `[${r.severity}] ${r.description}`).join('; ')}`);
    }

    const recs = await this.prisma.aIRecommendation.findMany({
      where: { projectId },
      orderBy: { generatedAt: 'desc' },
      take: 3,
    });
    if (recs.length > 0) {
      out.push(`Recommendations: ${recs.map(r => r.recommendation).join('; ')}`);
    }
  }

  private async gatherStudentContext(userId: string, out: string[]) {
    const project = await this.prisma.project.findFirst({
      where: { studentId: userId, status: { in: ['ACTIVE', 'PROPOSED', 'ON_HOLD'] } },
      include: {
        milestones: { orderBy: { dueDate: 'asc' } },
        submissions: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!project) return;

    await this.gatherProjectContext(project.id, out);
  }

  private async gatherSupervisorContext(out: string[]) {
    const projects = await this.prisma.project.findMany({
      where: { status: { in: ['ACTIVE', 'PROPOSED', 'ON_HOLD'] } },
      include: {
        milestones: true,
        submissions: { orderBy: { createdAt: 'desc' }, take: 1 },
        student: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    if (projects.length === 0) return;

    const now = new Date();
    out.push(`Active projects under supervision: ${projects.length}`);

    const atRisk = projects.filter(p =>
      p.milestones.some(m => m.status !== MilestoneStatus.COMPLETED && new Date(m.dueDate) < now),
    );

    if (atRisk.length > 0) {
      out.push(
        `Projects with overdue milestones (${atRisk.length}): ${atRisk.map(p => {
          const s = p.student;
          const name = s ? [s.firstName, s.lastName].filter(Boolean).join(' ') || s.email : 'Unknown';
          return `"${p.title}" (student: ${name})`;
        }).join(', ')}`,
      );
    }

    const noSubmission = projects.filter(p => {
      if (p.submissions.length === 0) return true;
      const daysSince = (now.getTime() - new Date(p.submissions[0].createdAt).getTime()) / 86_400_000;
      return daysSince > 14;
    });

    if (noSubmission.length > 0) {
      out.push(
        `Projects with no recent submission (${noSubmission.length}): ${noSubmission.slice(0, 5).map(p => `"${p.title}"`).join(', ')}`,
      );
    }

    const risks = await this.prisma.aIRiskSignal.findMany({
      orderBy: { generatedAt: 'desc' },
      take: 5,
    });
    if (risks.length > 0) {
      out.push(`Recent risk signals: ${risks.map(r => `[${r.severity}] ${r.description}`).join('; ')}`);
    }
  }

  private suggestQuestions(role: 'STUDENT' | 'SUPERVISOR', hasProject: boolean): string[] {
    if (role === 'SUPERVISOR') {
      return ['Which students are at risk?', 'Which projects need my review?', 'Summarise recent activity'];
    }
    if (!hasProject) {
      return ['What milestones are pending?', 'What is my health score?', 'What should I do next?'];
    }
    return ['What milestones are overdue?', 'What are the risks?', 'What should I do next?', 'Give me a forecast'];
  }
}

function buildSystemPrompt(role: string, contextParts: string[]): string {
  const contextBlock =
    contextParts.length > 0
      ? `\n\nProject context (use this data to answer — reference items by their exact names):\n${contextParts.map(c => `• ${c}`).join('\n')}`
      : '\n\n(No specific project context available — give general best-practice advice.)';

  return `You are an AI assistant embedded in IPMS (Integrated Project Management System), a platform for managing student final-year academic projects.

You are speaking to a ${role.toLowerCase()}.${
    role === 'STUDENT'
      ? ' Help them understand their project status, milestones, risks, and what to do next.'
      : ' Help them monitor students, identify at-risk projects, and prioritise their review workload.'
  }

Guidelines:
• Be concise and actionable — 2 to 5 sentences unless more detail is genuinely needed.
• Ground your answer in the project context below when relevant. Reference milestones and submissions by their exact names.
• Do not invent milestone names, dates, or scores not present in the context.
• Use plain text. If listing items, use bullet points starting with "•". No markdown headers or bold.
• Never mention that you are an AI or reference your training data.
• Maintain context across the conversation — if the user refers to "that milestone" or "the last one", refer to the conversation history.${contextBlock}`;
}
