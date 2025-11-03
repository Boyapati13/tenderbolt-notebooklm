'use client';

import ProjectsList from '@/components/projects-list';

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <ProjectsList />
    </div>
  );
}
