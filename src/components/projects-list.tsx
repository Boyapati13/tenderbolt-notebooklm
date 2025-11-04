'use client';

export interface ProjectsListProps {
  locale?: string;
}

export function ProjectsList({ locale = 'en' }: ProjectsListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <p className="text-gray-500 dark:text-gray-400">
          No projects yet. Create one to get started.
        </p>
      </div>
    </div>
  );
}

export default ProjectsList;
