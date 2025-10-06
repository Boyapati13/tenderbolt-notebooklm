"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function WorkspacePage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch project data based on projectId
    const fetchProject = async () => {
      try {
        setLoading(true);
        // You can add API call here to fetch project data
        // const response = await fetch(`/api/projects/${projectId}`);
        // const data = await response.json();
        // setProject(data);
        
        // For now, just simulate loading
        setTimeout(() => {
          setProject({
            id: projectId,
            name: `Project ${projectId}`,
            status: 'Active'
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching project:', error);
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Workspace: {project?.name || 'Unknown Project'}
          </h1>
          <p className="text-muted-foreground">
            Project ID: {projectId}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Project Details</h3>
            <p className="text-sm text-muted-foreground">
              Status: {project?.status || 'Unknown'}
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-sm text-muted-foreground">
              Manage project documents and files
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Collaboration</h3>
            <p className="text-sm text-muted-foreground">
              Team members and communication
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Project Workspace</h3>
            <p className="text-muted-foreground">
              This is the workspace for project {projectId}. You can add your project-specific content here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
