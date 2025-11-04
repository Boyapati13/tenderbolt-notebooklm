'use client';

import { useEffect, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { NewProjectModal } from "@/components/new-project-modal";

type Project = {
  id: string;
  title: string;
  description?: string;
  status: string;
  value?: number;
  deadline?: string;
  winProbability?: number;
  client?: string;
  teamMembers?: string[];
  stage?: string;
  createdAt: string;
  autoExtractedTitle?: string;
  autoExtractedBudget?: string;
  autoExtractedLocation?: string;
  autoExtractedDeadlines?: string;
  stages?: Array<{
    id: string;
    name: string;
    status: string;
    dueDate?: string;
  }>;
};

type PipelineStage = {
  id: string;
  name: string;
  color: string;
  projects: Project[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      const projectsData = data.projects || [];
      setProjects(projectsData);
      
      // Organize projects into pipeline stages
      const stages = [
        { id: "qualification", name: "Qualification", color: "bg-blue-100 text-blue-800" },
        { id: "analysis", name: "Analysis", color: "bg-yellow-100 text-yellow-800" },
        { id: "proposal", name: "Proposal", color: "bg-purple-100 text-purple-800" },
        { id: "review", name: "Review", color: "bg-orange-100 text-orange-800" },
        { id: "awarded", name: "Awarded", color: "bg-green-100 text-green-800" },
      ];

      const organizedStages = stages.map(stage => ({
        ...stage,
        projects: projectsData.filter(project => {
          const status = project.status.toLowerCase();
          switch (stage.id) {
            case "qualification":
              return status === "discovery";
            case "analysis":
              return status === "interested";
            case "proposal":
              return status === "working";
            case "review":
              return status === "submitted";
            case "awarded":
              return status === "won" || status === "closed" || status === "lost" || status === "not_interested";
            default:
              return false;
          }
        })
      }));

      setPipelineStages(organizedStages);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "lost": return <XCircle className="w-4 h-4 text-red-600" />;
      case "active":
      case "working":
      case "submitted":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "discovery":
      case "interested":
      default: return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600 bg-green-100";
    if (probability >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleProjectClick = (projectId: string) => {
    // Navigate to workspace
    window.location.href = `/workspace/${projectId}`;
  };
  
  const handleNewProject = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchProjects();
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Project Pipeline</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">CRM-style pipeline view of all tender projects</p>
        </div>
        <button 
          onClick={handleNewProject}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-300" size={20} />
            <input
              type="text"
              placeholder="Search projects by title or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-600 dark:text-slate-300" size={20} />
            <select className="px-3 py-2 input">
              <option value="all">All Stages</option>
              <option value="qualification">Qualification</option>
              <option value="analysis">Analysis</option>
              <option value="proposal">Proposal</option>
              <option value="review">Review</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${stage.color}`}>
                {stage.name}
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">{stage.projects.length}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">projects</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline View */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6">Pipeline Stages</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">{stage.name}</h3>
                <span className="text-sm text-slate-600 dark:text-slate-300">{stage.projects.length}</span>
              </div>
              
              <div className="space-y-3 min-h-[400px]">
                {stage.projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 line-clamp-2">
                          {project.autoExtractedTitle || project.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(project.status)}
                          <span className="text-xs text-slate-600 dark:text-slate-300 capitalize">{project.status.replace('_',' ')}</span>
                        </div>
                      </div>
                      <button className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-600 dark:text-slate-300">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {project.client && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600 dark:text-slate-300">Client</span>
                          <span className="text-xs font-medium">{project.client}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Value</span>
                        <span className="text-xs font-medium">
                          {project.autoExtractedBudget || (project.value ? `$${project.value.toLocaleString()}` : '$TBD')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Win Probability</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getWinProbabilityColor(project.winProbability || 0)}`}>
                          {project.winProbability || 0}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Deadline</span>
                        <span className="text-xs font-medium">
                          {project.autoExtractedDeadlines || (project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                        <span className="text-blue-600 font-medium">Click to open →</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {stage.projects.length === 0 && (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-300">
                    <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <Plus size={24} className="text-slate-600 dark:text-slate-300" />
                    </div>
                    <div className="text-sm">No projects</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
