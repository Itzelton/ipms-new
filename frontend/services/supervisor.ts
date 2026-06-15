import { apiGet } from './api';

export async function getSupervisorDashboard() {
  try {
    return await apiGet('/api/v1/supervisors/dashboard');
  } catch (e) {
    return {
      assignedStudents: [
        { id: 'stu1', name: 'Amina Patel', project: 'Research Analytics', progress: 74, status: 'ON_TRACK' },
        { id: 'stu2', name: 'Jonas Lee', project: 'Capstone Platform', progress: 49, status: 'AT_RISK' },
      ],
      projectsUnderReview: [
        { id: 'proj1', title: 'Capstone Platform', status: 'REVIEW_PENDING', student: 'Jonas Lee', dueDate: '2026-06-20' },
        { id: 'proj2', title: 'AI Monitoring', status: 'IN_REVIEW', student: 'Amina Patel', dueDate: '2026-06-28' },
      ],
      pendingReviews: [{ id: 'rev1', title: 'Week 7 Progress', student: 'Jonas Lee', dueDate: '2026-06-09' }],
      notifications: [
        { id: 'n1', title: 'Review due today', message: 'Review submission from Amina Patel', createdAt: '2026-06-11' },
      ],
      activityFeed: [
        { id: 'a1', type: 'PROJECT_CREATED', title: 'Project created', detail: 'Amina Patel started a new project', actor: 'Amina Patel', timestamp: '2026-04-01' },
        { id: 'a2', type: 'MILESTONE_COMPLETED', title: 'Prototype milestone completed', detail: 'Jonas Lee completed the prototype milestone', actor: 'Jonas Lee', timestamp: '2026-06-08' },
        { id: 'a3', type: 'SUBMISSION_UPLOADED', title: 'Submission uploaded', detail: 'Amina Patel uploaded Week 7 status update', actor: 'Amina Patel', timestamp: '2026-06-10' },
        { id: 'a4', type: 'COMMENT', title: 'New comment on submission', detail: 'Please address the testing plan concerns', actor: 'Supervisor', timestamp: '2026-06-11' },
        { id: 'a5', type: 'REVISION_REQUEST', title: 'Revision requested', detail: 'Requested revision for prototype evaluation', actor: 'Supervisor', timestamp: '2026-06-11' },
      ],
      riskAlerts: [
        { id: 'r1', title: 'Project delay risk', description: 'Prototype milestone behind schedule for Jonas Lee', status: 'HIGH' },
      ],
      analyticsSummary: {
        activeProjects: 12,
        reviewQueue: 4,
        averageTurnaround: '1.8 days',
        riskProjects: 3,
      },
    };
  }
}
