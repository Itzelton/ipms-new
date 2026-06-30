import { apiGet } from './api';

export async function getStudentDashboard() {
  try {
    // Real app: /api/v1/students/dashboard
    return await apiGet('/api/v1/students/dashboard');
  } catch (e) {
    // Fallback fake data for local dev
    return {
      activeProject: { id: 'p1', title: 'Capstone Project', progress: 62 },
      milestones: [
        { id: 'm1', title: 'Proposal', status: 'COMPLETED', dueDate: '2026-05-01' },
        { id: 'm2', title: 'Prototype', status: 'IN_PROGRESS', dueDate: '2026-06-15' },
        { id: 'm3', title: 'Final Report', status: 'PENDING', dueDate: '2026-07-30' },
      ],
      recentSubmissions: [
        { id: 's1', title: 'Week 6 Update', submittedAt: '2026-06-05', status: 'REVIEWED' },
      ],
      notifications: [
        { id: 'n1', title: 'Supervisor feedback', message: 'Please revise section 2', createdAt: '2026-06-06' }
      ],
      activity: [
        { id: 'a1', type: 'PROJECT_CREATED', title: 'Project created', detail: 'Capstone Project was created by your supervisor', actor: 'Dr. Sofia Khan', timestamp: '2026-04-01' },
        { id: 'a2', type: 'MILESTONE_COMPLETED', title: 'Proposal milestone completed', detail: 'Student completed the proposal milestone', actor: 'You', timestamp: '2026-05-01' },
        { id: 'a3', type: 'SUBMISSION_UPLOADED', title: 'Submission uploaded: Week 6 Update', detail: 'Your progress report was uploaded for review', actor: 'You', timestamp: '2026-06-05' },
        { id: 'a4', type: 'COMMENT', title: 'Supervisor comment received', detail: 'Please revisit the user personas section', actor: 'Dr. Sofia Khan', timestamp: '2026-06-06' },
        { id: 'a5', type: 'REVISION_REQUEST', title: 'Revision requested', detail: 'Supervisor requested changes to section 2', actor: 'Dr. Sofia Khan', timestamp: '2026-06-06' },
      ],
      healthScore: {
        score: 78,
        category: 'Stable',
        color: 'bg-yellow-100 text-yellow-800',
        trend: 'Stable',
        breakdown: {
          milestoneCompletion: 80,
          deadlineCompliance: 72,
          submissionConsistency: 75,
          supervisorEngagement: 65,
          projectActivity: 70,
        },
      },
      aiInsights: [{ id: 'ai1', title: 'Risk: Delayed prototype', summary: 'Prototype milestone behind schedule' }],
    };
  }
}
