'use client';

import { useEffect, useState } from "react";
import { NewProjectModal } from "./new-project-modal";
import { EditProjectModal } from "./edit-project-modal";
import { integrationService } from "@/lib/integrations";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock, 
  Search, 
  Filter, 
  Plus,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  ExternalLink,
  Tag,
  Star,
  Circle,
  Plug
} from "lucide-react";

type TeamMember = {
  id: string;
  user: {
    name: string | null;
    email: string;
    avatar: string | null;
    role: string | null;
  };
  role: string;
};

type ExternalLinkType = {
  id: string;
  label: string;
  url: string;
  type: string;
};

type Project = {
  id: string;
  title: string;
  status: string;
  value?: number;
  deadline?: string;
  winProbability?: number;
  client?: string;
  teamMembers?: TeamMember[];
  stage?: string;
  createdAt: string;
  priority?: string | null;
  tags?: string | null;
  oneDriveLink?: string | null;
  googleDriveLink?: string | null;
  externalLinks?: ExternalLinkType[];
  autoExtractedTitle?: string;
  autoExtractedBudget?: string;
  autoExtractedLocation?: string;
  autoExtractedDeadlines?: string;
};

type KPIData = {
  winRate: number;
  totalValue: number;
  avgROI: number;
  avgSubmissionTime: number;
  activeProjects: number;
  completedProjects: number;
};

export function CRMDashboard({ onProjectClick }: { onProjectClick: (projectId: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [kpis, setKpis] = useState<KPIData>({
    winRate: 0,
    totalValue: 0,
    avgROI: 0,
    avgSubmissionTime: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch projects with team members and external links
      const projectsResponse = await fetch("/api/projects");
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Fetch KPIs
      const kpisResponse = await fetch("/api/dashboard/metrics");
      const kpisData = await kpisResponse.json();
      setKpis(kpisData.metrics || {
        winRate: 78.5,
        totalValue: 2450000,
        avgROI: 23.4,
        avgSubmissionTime: 12.5,
        activeProjects: 8,
        completedProjects: 24,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": 
      case "closed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "lost":
      case "not_interested": return <XCircle className="w-4 h-4 text-red-600" />;
      case "working":
      case "submitted": return <Clock className="w-4 h-4 text-blue-600" />;
      case "interested":
      case "discovery": return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": 
      case "closed": return "bg-green-100 text-green-800";
      case "lost":
      case "not_interested": return "bg-red-100 text-red-800";
      case "working": return "bg-blue-100 text-blue-800";
      case "submitted": return "bg-purple-100 text-purple-800";
      case "interested": return "bg-yellow-100 text-yellow-800";
      case "discovery": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority?.toLowerCase()) {
      case "high": return "text-red-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-green-600";
      default: return "text-muted-foreground";
    }
  };

  const getPriorityIcon = (priority: string | null | undefined) => {
    return <Star className={`w-4 h-4 ${getPriorityColor(priority)}`} fill={priority === "high" ? "currentColor" : "none"} />;
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600 bg-green-50";
    if (probability >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || project.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === "all" || (project.priority && project.priority.toLowerCase() === priorityFilter);
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Project Management</h1>
          <p className="text-muted-foreground mt-2">CRM-style overview of all projects</p>
        </div>
        <button 
          onClick={() => setShowNewProjectModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="text-3xl font-bold text-card-foreground">{kpis.winRate}%</p>
            </div>
            <div className="w-12 h-12 rounded bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">+5.2%</span>
            <span className="text-muted-foreground text-sm ml-1">from last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Value</p>
              <p className="text-3xl font-bold text-card-foreground">${(kpis.totalValue / 1000000).toFixed(1)}M</p>
            </div>
            <div className="w-12 h-12 rounded bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">+12.3%</span>
            <span className="text-muted-foreground text-sm ml-1">from last quarter</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average ROI</p>
              <p className="text-3xl font-bold text-card-foreground">{kpis.avgROI}%</p>
            </div>
            <div className="w-12 h-12 rounded bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">+2.1%</span>
            <span className="text-muted-foreground text-sm ml-1">from last month</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Submission Time</p>
              <p className="text-3xl font-bold text-card-foreground">{kpis.avgSubmissionTime} days</p>
            </div>
            <div className="w-12 h-12 rounded bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">-3.2 days</span>
            <span className="text-muted-foreground text-sm ml-1">from last month</span>
          </div>
        </div>
      </div>

      {/* Quick Integrations Status */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-card-foreground">Integrations</span>
            <span className="text-xs text-muted-foreground">
              ({integrationService.getIntegrations().filter(i => i.status === 'connected').length} connected)
            </span>
          </div>
          <a 
            href="/integrations" 
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Manage →
          </a>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Search projects by title or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Stages</option>
              <option value="discovery">Discovery</option>
              <option value="interested">Interested</option>
              <option value="working">Working</option>
              <option value="submitted">Submitted</option>
              <option value="closed">Closed</option>
              <option value="not_interested">Not Interested</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer group"
              onClick={() => onProjectClick(project.id)}
            >
              {/* Header with Priority and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(project.priority)}
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-1 text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={(e) => { e.stopPropagation(); onProjectClick(project.id); }}
                    title="View Workspace"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="p-1 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setSelectedProjectForEdit(project);
                      setShowEditModal(true);
                    }}
                    title="Edit Project"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(project.status)}
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Project Details */}
              <div className="space-y-3 mb-4">
                {project.client && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Client</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{project.client}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Value</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {project.autoExtractedBudget || (project.value ? `$${project.value.toLocaleString()}` : 'TBD')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Win Probability</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-md ${getWinProbabilityColor(project.winProbability || 0)}`}>
                    {project.winProbability || 0}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Deadline</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {project.autoExtractedDeadlines || (project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD')}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {project.tags && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Tag size={14} className="text-muted-foreground" />
                  {project.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Team Members */}
              {project.teamMembers && project.teamMembers.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-muted-foreground" />
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-sm"
                        title={member.user.name || member.user.email}
                      >
                        {getInitials(member.user.name)}
                      </div>
                    ))}
                    {project.teamMembers.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-muted-foreground text-xs font-semibold border-2 border-white shadow-sm">
                        +{project.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* External Links */}
              {(project.oneDriveLink || project.googleDriveLink || (project.externalLinks && project.externalLinks.length > 0)) && (
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <ExternalLink size={14} className="text-gray-400" />
                  {project.oneDriveLink && (
                    <a
                      href={project.oneDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md font-medium hover:bg-blue-100 transition-colors"
                    >
                      OneDrive
                    </a>
                  )}
                  {project.googleDriveLink && (
                    <a
                      href={project.googleDriveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-md font-medium hover:bg-green-100 transition-colors"
                    >
                      Google Drive
                    </a>
                  )}
                  {project.externalLinks && project.externalLinks.slice(0, 2).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md font-medium hover:bg-purple-100 transition-colors"
                      title={link.description || link.label}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first project"
              }
            </p>
            <button 
              onClick={() => setShowNewProjectModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Project
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onSuccess={fetchData}
      />

      {selectedProjectForEdit && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProjectForEdit(null);
          }}
          projectId={selectedProjectForEdit.id}
          currentData={{
            title: selectedProjectForEdit.title,
            description: null,
            client: selectedProjectForEdit.client,
            value: selectedProjectForEdit.value,
            deadline: selectedProjectForEdit.deadline,
            status: selectedProjectForEdit.status, // Added status field
            priority: selectedProjectForEdit.priority,
            tags: selectedProjectForEdit.tags,
            oneDriveLink: selectedProjectForEdit.oneDriveLink,
            googleDriveLink: selectedProjectForEdit.googleDriveLink,
          }}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
