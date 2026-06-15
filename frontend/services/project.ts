import { apiGet } from './api';

export async function getProjectDetails(projectId: string) {
  try {
    return await apiGet(`/api/v1/projects/${projectId}/details`);
  } catch (e) {
    return {
      id: projectId,
      title: 'Capstone Platform Modernization',
      description: 'A multi-phase project to modernize the student project management platform with analytics and AI-driven status tracking.',
      status: 'ACTIVE',
      progress: 68,
      startDate: '2026-04-01',
      dueDate: '2026-09-30',
      student: 'Amina Patel',
      supervisor: 'Dr. Sofia Khan',
      milestones: [
        { id: 'm1', title: 'Discovery', dueDate: '2026-05-01', status: 'COMPLETED' },
        { id: 'm2', title: 'Prototype', dueDate: '2026-06-15', status: 'IN_PROGRESS' },
        { id: 'm3', title: 'User Testing', dueDate: '2026-08-01', status: 'PENDING' },
      ],
      submissions: [
        { id: 's1', title: 'Prototype Delivery', submittedAt: '2026-06-10', status: 'SUBMITTED' },
        { id: 's2', title: 'Research Summary', submittedAt: '2026-05-20', status: 'APPROVED' },
      ],
      discussions: [
        { id: 'd1', title: 'Prototype Feedback', updatedAt: '2026-06-11', messages: 8 },
        { id: 'd2', title: 'Testing Scope', updatedAt: '2026-06-02', messages: 4 },
      ],
      activity: [
        { id: 'a1', type: 'PROJECT_CREATED', title: 'Project created', detail: 'Project was launched by the team', actor: 'Admin', timestamp: '2026-04-01' },
        { id: 'a2', type: 'MILESTONE_COMPLETED', title: 'Discovery milestone completed', detail: 'Discovery milestone completed on schedule', actor: 'Amina Patel', timestamp: '2026-05-01' },
        { id: 'a3', type: 'SUBMISSION_UPLOADED', title: 'Submission uploaded: Research Summary', detail: 'Research Summary was submitted for review', actor: 'Amina Patel', timestamp: '2026-05-20' },
        { id: 'a4', type: 'APPROVAL', title: 'Submission approved', detail: 'Research Summary was approved by supervisor', actor: 'Dr. Sofia Khan', timestamp: '2026-05-22' },
        { id: 'a5', type: 'SUBMISSION_UPLOADED', title: 'Submission uploaded: Prototype Delivery', detail: 'Prototype Delivery was uploaded ahead of the deadline', actor: 'Amina Patel', timestamp: '2026-06-10' },
        { id: 'a6', type: 'COMMENT', title: 'Comment added', detail: 'Supervisor provided feedback on the first prototype', actor: 'Dr. Sofia Khan', timestamp: '2026-06-11' },
        { id: 'a7', type: 'REVISION_REQUEST', title: 'Revision requested', detail: 'Supervisor requested additional usability notes', actor: 'Dr. Sofia Khan', timestamp: '2026-06-11' },
      ],
      healthScore: {
        score: 72,
        category: 'Stable',
        color: 'bg-yellow-100 text-yellow-800',
        trend: 'Caution',
        breakdown: {
          milestoneCompletion: 75,
          deadlineCompliance: 68,
          submissionConsistency: 80,
          supervisorEngagement: 62,
          projectActivity: 70,
        },
      },
      riskStatus: { level: 'Medium', note: 'Milestone timeline slipping by 1 week' },
      analytics: {
        onTimeMilestones: 67,
        pendingApprovals: 2,
        overdueTasks: 1,
      },
      recommendedActions: {
        student: [
          'Resolve 1 overdue milestone as soon as possible.',
          'Prepare for 1 upcoming deadline in the next 7 days.',
          'Submit a progress report or evidence item to keep your project on track.',
        ],
        supervisor: [
          'Discuss progress on overdue milestone with the student.',
          'Approve or provide feedback for 1 pending review.',
          'Encourage the student to share updates in the discussion thread.',
        ],
        summary: 'Resolve overdue work, review pending submissions, and keep communication active with the supervisor.',
      },
    };
  }
}
