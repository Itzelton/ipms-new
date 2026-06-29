"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupervisorPerformanceGenerator = void 0;
class SupervisorPerformanceGenerator {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate(params) {
        const { scope, supervisorId, cohortId, departmentId } = params;
        const where = {};
        if (scope === 'SUPERVISOR' && supervisorId)
            where.id = supervisorId;
        if (scope === 'COHORT' && cohortId) {
            const supervisors = await this.prisma.user.findMany({
                where: {
                    supervisorProfile: { isNot: null },
                    supervisedProjects: { some: { cohortId } },
                },
                select: { id: true, firstName: true, lastName: true, preferredName: true },
            });
            const rows = [];
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
            const rows = [];
            for (const s of supervisors) {
                rows.push(await this.buildRow(s.id));
            }
            return { title: 'Supervisor Performance Report', rows };
        }
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
        const rows = [];
        for (const s of supervisors)
            rows.push(await this.buildRow(s.id));
        return { title: 'Supervisor Performance Report', rows };
    }
    async buildRow(supervisorId) {
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
        const grades = submissions.map((s) => s.grade).filter((g) => typeof g === 'number');
        const averageGrade = grades.length ? grades.reduce((a, b) => a + b, 0) / grades.length : undefined;
        const healthScores = await this.prisma.aIHealthScore.findMany({
            where: { projectId: { in: projects.map((p) => p.id) } },
            select: { score: true },
        });
        const avgHealthScore = healthScores.length
            ? healthScores.reduce((a, s) => a + s.score, 0) / healthScores.length
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
exports.SupervisorPerformanceGenerator = SupervisorPerformanceGenerator;
