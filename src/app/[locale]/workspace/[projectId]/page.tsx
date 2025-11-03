import { ProjectWorkspace } from '@/components/project-workspace';

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  return <ProjectWorkspace projectId={params.projectId} />;
}
