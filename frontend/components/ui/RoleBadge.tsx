"use client";
import React from 'react';

export default function RoleBadge({ role }: { role?: string | null }) {
  if (!role) return null;
  return <span className="px-2 py-1 text-xs bg-gray-100 rounded">{role.toLowerCase()}</span>;
}
