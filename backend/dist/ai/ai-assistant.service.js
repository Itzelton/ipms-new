"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiAssistantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma/prisma.service");
const prompt_templates_1 = require("./prompt/prompt-templates");
let AiAssistantService = class AiAssistantService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async chat(dto) {
        const message = (dto.message || '').toLowerCase();
        const role = dto.roleHint || 'STUDENT';
        const intent = this.classifyIntent(message, role);
        const projectId = dto.projectId;
        if (intent === 'UNKNOWN') {
            return {
                answerText: 'I can help with milestones, health score, risks, and next steps. Try: “What milestones are pending?”, “Why is my health score low?”, “What should I do next?”, or for supervisors: “Which students are at risk?”',
                suggestedNextQuestions: [
                    'What milestones are pending?',
                    'Why is my health score low?',
                    'What should I do next?'
                ],
                evidence: [{
                        type: 'ACTIVITY',
                        label: 'System policy',
                        data: { policy: prompt_templates_1.ASSISTANT_SYSTEM_POLICY }
                    }],
            };
        }
        if (!projectId && role === 'STUDENT' && intent !== 'SUMMARIZE_RECENT_ACTIVITY') {
            return {
                answerText: 'To answer that, I need which project you mean. Select a project (or provide a projectId) and ask again.',
                suggestedNextQuestions: [
                    'What milestones are pending?',
                    'Why is my health score low?'
                ]
            };
        }
        const project = projectId
            ? await this.prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true, title: true }
            })
            : null;
        const evidence = [];
        switch (intent) {
            case 'MILESTONES_PENDING': {
                if (!projectId)
                    throw new Error('projectId required');
                const pending = await this.prisma.milestone.findMany({
                    where: { projectId, status: 'PENDING' },
                    select: { id: true, title: true, dueDate: true, status: true }
                });
                pending.forEach((m) => evidence.push({
                    type: 'MILESTONE',
                    label: m.title,
                    data: { dueDate: m.dueDate, status: m.status }
                }));
                const bullets = pending.length
                    ? pending.map((m) => `${m.title} (due: ${m.dueDate?.toISOString().slice(0, 10)})`)
                    : ['No pending milestones found.'];
                return {
                    answerText: `Pending milestones${project?.title ? ` for “${project.title}”` : ''}:`,
                    bullets,
                    evidence,
                    suggestedNextQuestions: ['What should I do next?', 'Why is my health score low?']
                };
            }
            case 'HEALTH_SCORE_LOW': {
                if (!projectId)
                    throw new Error('projectId required');
                const hs = await this.prisma.aIHealthScore.findMany({
                    where: { projectId },
                    orderBy: { generatedAt: 'desc' },
                    take: 1
                });
                const health = hs[0];
                evidence.push({
                    type: 'HEALTH_SCORE',
                    label: 'Latest health score',
                    data: { score: health?.score, classification: health?.classification, generatedAt: health?.generatedAt }
                });
                const low = typeof health?.score === 'number' ? health.score < 50 : false;
                if (!low) {
                    return {
                        answerText: 'Your latest health score does not look critically low based on the stored AI health signal.',
                        bullets: [`Current score: ${health?.score ?? 'N/A'}`],
                        evidence,
                        suggestedNextQuestions: ['What should I do next?', 'Summarize recent activity']
                    };
                }
                const risks = await this.prisma.aIRiskSignal.findMany({
                    where: { projectId },
                    orderBy: { generatedAt: 'desc' },
                    take: 5
                });
                risks.forEach((r) => evidence.push({
                    type: 'RISK_SIGNAL',
                    label: `Risk (${r.severity})`,
                    data: { description: r.description, generatedAt: r.generatedAt }
                }));
                return {
                    answerText: 'Your health score appears low due to the following stored risk signals and project dynamics:',
                    bullets: risks.map((r) => `${r.severity}: ${r.description}`),
                    evidence,
                    suggestedNextQuestions: ['What should I do next?', 'Which milestone is most at risk?']
                };
            }
            case 'NEXT_STEPS': {
                if (!projectId)
                    throw new Error('projectId required');
                const rec = await this.prisma.aIRecommendation.findMany({
                    where: { projectId },
                    orderBy: { generatedAt: 'desc' },
                    take: 3
                });
                rec.forEach((r) => evidence.push({
                    type: 'RECOMMENDATION',
                    label: 'AI recommendation',
                    data: { category: r.category, recommendation: r.recommendation, generatedAt: r.generatedAt }
                }));
                const bullets = rec.length
                    ? rec.map((r) => r.recommendation)
                    : ['No stored recommendations yet. Ask the assistant again after AI signals are generated.'];
                return {
                    answerText: `Next steps${project?.title ? ` for “${project.title}”` : ''}:`,
                    bullets,
                    evidence,
                    suggestedNextQuestions: ['What milestones are pending?', 'Summarize recent activity']
                };
            }
            case 'SUMMARIZE_RECENT_ACTIVITY': {
                if (!projectId) {
                    return {
                        answerText: 'Select a project (or provide a projectId) so I can summarize recent activity.',
                        suggestedNextQuestions: ['Summarize recent activity']
                    };
                }
                const latestMilestones = await this.prisma.milestone.findMany({
                    where: { projectId },
                    orderBy: { updatedAt: 'desc' },
                    take: 5
                });
                const latestSubmissions = await this.prisma.submission.findMany({
                    where: { projectId },
                    orderBy: { updatedAt: 'desc' },
                    take: 5
                });
                latestMilestones.forEach((m) => evidence.push({
                    type: 'MILESTONE',
                    label: m.title,
                    data: { status: m.status, updatedAt: m.updatedAt }
                }));
                latestSubmissions.forEach((s) => evidence.push({
                    type: 'SUBMISSION',
                    label: 'Submission',
                    data: { status: s.status, updatedAt: s.updatedAt, milestoneId: s.milestoneId }
                }));
                const bullets = [
                    ...latestMilestones.map((m) => `Milestone updated: ${m.title} → ${m.status}`),
                    ...latestSubmissions.map((s) => `Submission updated: status ${s.status}`)
                ].slice(0, 8);
                return {
                    answerText: `Recent activity${project?.title ? ` for “${project.title}”` : ''}:`,
                    bullets,
                    evidence,
                    suggestedNextQuestions: ['What should I do next?', 'Why is my health score low?']
                };
            }
            case 'SUPERVISOR_AT_RISK':
            case 'PROJECTS_NEED_REVIEW': {
                if (!projectId) {
                    return {
                        answerText: 'For MVP, provide a projectId for supervisor questions so the assistant can retrieve relevant risk/recommendations.',
                    };
                }
                const risks = await this.prisma.aIRiskSignal.findMany({
                    where: { projectId },
                    orderBy: { generatedAt: 'desc' },
                    take: 5
                });
                risks.forEach((r) => evidence.push({
                    type: 'RISK_SIGNAL',
                    label: `Risk (${r.severity})`,
                    data: { description: r.description, generatedAt: r.generatedAt }
                }));
                return {
                    answerText: 'Projects/students at risk (from stored AI risk signals):',
                    bullets: risks.map((r) => `${r.severity}: ${r.description}`),
                    evidence,
                    suggestedNextQuestions: ['Summarize recent activity', 'What should be reviewed next?']
                };
            }
            default:
                return {
                    answerText: 'I cannot determine the request type yet.'
                };
        }
    }
    classifyIntent(message, role) {
        if (message.includes('milestone') && (message.includes('pending') || message.includes('todo') || message.includes('not done'))) {
            return 'MILESTONES_PENDING';
        }
        if (message.includes('health score') || message.includes('health') || message.includes('score low')) {
            return 'HEALTH_SCORE_LOW';
        }
        if (message.includes('next') || message.includes('do next') || message.includes('what should i do')) {
            return role === 'STUDENT' ? 'NEXT_STEPS' : 'NEXT_STEPS';
        }
        if (role === 'SUPERVISOR' && (message.includes('at risk') || message.includes('risk'))) {
            return 'SUPERVISOR_AT_RISK';
        }
        if (role === 'SUPERVISOR' && (message.includes('review') || message.includes('projects need') || message.includes('needing'))) {
            return 'PROJECTS_NEED_REVIEW';
        }
        if (message.includes('summarize') || message.includes('recent activity') || message.includes('activity')) {
            return 'SUMMARIZE_RECENT_ACTIVITY';
        }
        return 'UNKNOWN';
    }
};
exports.AiAssistantService = AiAssistantService;
exports.AiAssistantService = AiAssistantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiAssistantService);
