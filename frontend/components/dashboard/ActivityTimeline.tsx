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
    return <div className="p-4 bg-white rounded shadow">No recent activity</div>;
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-4">Activity Timeline</h4>
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
