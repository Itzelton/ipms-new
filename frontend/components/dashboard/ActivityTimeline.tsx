"use client";
import React, { useMemo } from 'react';
import { Timeline, TimelineItem } from '../ui/Timeline';

export type ActivityType =
  | 'PROJECT_CREATED'
  | 'SUBMISSION_UPLOADED'
  | 'COMMENT'
  | 'REPLY'
  | 'REVISION_REQUEST'
  | 'APPROVAL'
  | 'MILESTONE_COMPLETED'
  | 'CUSTOM';

export type ActivityTimelineItem = {
  id: string;
  type?: ActivityType;
  title?: string;
  detail?: string;
  actor?: string;
  timestamp: string;
  badge?: string;
  meta?: string;
};

const activityMap = (item: ActivityTimelineItem) => {
  const base = {
    id: item.id,
    timestamp: item.timestamp,
    badge: item.badge || item.type?.replace('_', ' '),
    title: item.title || item.detail || 'Activity event',
    description: item.detail,
    meta: item.meta,
  };

  switch (item.type) {
    case 'PROJECT_CREATED':
      return { ...base, title: item.title || 'Project created', description: item.detail || `Created by ${item.actor || 'team'}`, badge: 'Project' };
    case 'SUBMISSION_UPLOADED':
      return { ...base, title: item.title || 'Submission uploaded', description: item.detail || `Uploaded by ${item.actor || 'student'}`, badge: 'Submission' };
    case 'COMMENT':
      return { ...base, title: item.title || 'Comment added', description: item.detail || `Comment by ${item.actor || 'participant'}`, badge: 'Comment' };
    case 'REPLY':
      return { ...base, title: item.title || 'Reply posted', description: item.detail || `Reply by ${item.actor || 'participant'}`, badge: 'Reply' };
    case 'REVISION_REQUEST':
      return { ...base, title: item.title || 'Revision requested', description: item.detail || `Requested by ${item.actor || 'supervisor'}`, badge: 'Revision' };
    case 'APPROVAL':
      return { ...base, title: item.title || 'Submission approved', description: item.detail || `Approved by ${item.actor || 'reviewer'}`, badge: 'Approval' };
    case 'MILESTONE_COMPLETED':
      return { ...base, title: item.title || 'Milestone completed', description: item.detail || `Completed by ${item.actor || 'student'}`, badge: 'Milestone' };
    default:
      return base;
  }
};

export default function ActivityTimeline({ items }: { items?: ActivityTimelineItem[] }) {
  const timelineItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    return [...items]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(activityMap);
  }, [items]);

  if (!timelineItems.length) {
    return (
      <div className="card p-6">
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <svg className="h-6 w-6 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-500">No recent activity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 shadow-sm">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Activity Timeline</p>
      </div>
      <Timeline>
        {timelineItems.map((item) => (
          <TimelineItem
            key={item.id}
            title={item.title}
            description={item.description}
            timestamp={item.timestamp}
            badge={item.badge}
            meta={item.meta}
          />
        ))}
      </Timeline>
    </div>
  );
}
