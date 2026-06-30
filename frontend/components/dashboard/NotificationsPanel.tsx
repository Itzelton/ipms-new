"use client";
import React from 'react';

export default function NotificationsPanel({ notifications }: { notifications?: any[] }) {
  if (!notifications || notifications.length === 0) return (
    <div className="p-4 bg-white rounded shadow">No notifications</div>
  );

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-medium mb-2">Notifications</h4>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="text-sm">
            <div className="font-medium">{n.title}</div>
            <div className="text-gray-500">{n.message}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
