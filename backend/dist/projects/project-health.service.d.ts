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
export declare class ProjectHealthService {
    private readonly projectRepository;
    constructor(projectRepository: ProjectRepository);
    compute(projectId: string): Promise<ProjectHealthScoreResult | null>;
    computeRisk(projectId: string): Promise<{
        score: number;
        level: RiskLevel;
        note: string;
        reasons: string[];
        alerts: {
            supervisor: string;
            student: string;
        };
    } | null>;
    computeRecommendations(projectId: string): Promise<ProjectRecommendationsResult | null>;
    private getCategory;
    private getRiskLevel;
    private getColor;
}
