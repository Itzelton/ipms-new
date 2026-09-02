import { apiGet } from './api';

export async function getProjectDetails(projectId: string) {
  try {
    const details = await apiGet(`/projects/${projectId}/details`);
    if (details) return details;
    const project = await apiGet(`/projects/${projectId}`);
    if (!project) return null;
    return {
      ...project,
      milestones: project.milestones ?? [],
      submissions: project.submissions ?? [],
      discussionThreads: project.discussionThreads ?? [],
      analytics: project.analytics ?? [],
      recommendedActions: project.recommendedActions ?? [],
      activity: project.activity ?? [],
    };
  } catch {
    return null;
  }
}

export async function getProjectsForUser(_role?: 'STUDENT' | 'SUPERVISOR' | 'ADMIN') {
  return await apiGet('/projects');
}
