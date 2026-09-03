import { apiGet } from './api';

export async function getProjectDetails(projectId: string) {
  // Try the rich /details endpoint first; if it errors or times out, fall back
  // to the simpler /projects/:id endpoint so the page always renders.
  let details: any = null;
  try {
    details = await apiGet(`/projects/${projectId}/details`);
  } catch {
    // timeout or server error — fall through to the base endpoint
  }

  if (details) return details;

  try {
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
