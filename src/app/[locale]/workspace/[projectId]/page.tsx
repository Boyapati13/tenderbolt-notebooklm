"use client";

import { useParams, useRouter } from 'next/navigation';
import { ProjectWorkspace } from '@/components/project-workspace';

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const handleBack = () => {
    router.push('/en/dashboard');
  };

  return (
    <ProjectWorkspace 
      tenderId={projectId} 
      onBack={handleBack}
    />
  );
}
