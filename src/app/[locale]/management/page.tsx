"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  UserPlus,
  Tag,
  ExternalLink,
  Star,
  Calendar,
  DollarSign,
  Target,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Plug,
} from "lucide-react";
import { AssignTeamModal } from "@/components/assign-team-modal";
import { NewTenderModal } from "@/components/new-tender-modal";
import { EditProjectModal } from "@/components/edit-project-modal";
import { AddUserModal } from "@/components/add-user-modal";
import { integrationService } from "@/lib/integrations";

type TeamMember = {
  id: string;
  user: {
    id: string;
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
  description?: string | null;
};

type Tender = {
  id: string;
  title: string;
  status: string;
  value?: number;
  deadline?: string;
  winProbability?: number;
  client?: string;
  priority?: string | null;
  tags?: string | null;
  oneDriveLink?: string | null;
  googleDriveLink?: string | null;
  teamMembers?: TeamMember[];
  externalLinks?: ExternalLinkType[];
  createdAt: string;
  autoExtractedTitle?: string;
  autoExtractedBudget?: string;
  autoExtractedLocation?: string;
  autoExtractedDeadlines?: string;
};

type AnalyticsData = {
  winRate: number;
  totalValue: number;
  avgROI: number;
  avgSubmissionTime: number;
  activeTenders: number;
  completedTenders: number;
  teamPerformance: { [key: string]: { projects: number; wins: number; totalValue: number } };
};

export default function ManagementPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNewTenderModal, setShowNewTenderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "analytics">("projects");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch tenders
      const tendersResponse = await fetch("/api/tenders");
      const tendersData = await tendersResponse.json();
      setTenders(tendersData.tenders || []);
      if (tendersData.tenders?.length > 0 && !selectedTender) {
        setSelectedTender(tendersData.tenders[0]);
      }

      // Fetch analytics
      const analyticsResponse = await fetch("/api/tenders/analytics?timeframe=6months");
      const analyticsResponseData = await analyticsResponse.json();
      if (analyticsResponseData.success) {
        setAnalyticsData(analyticsResponseData.analytics);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeamMember = async (teamMemberId: string) => {
    if (!confirm("Remove this team member from the project?")) return;

    try {
      const response = await fetch(`/api/team-members?id=${teamMemberId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchData();
      } else {
        alert("Failed to remove team member");
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      alert("Error removing team member");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
      case "closed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "lost":
      case "not_interested":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "working":
      case "submitted":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "interested":
      case "discovery":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
      case "closed":
        return "bg-green-100 text-green-800";
      case "lost":
      case "not_interested":
        return "bg-red-100 text-red-800";
      case "working":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-purple-100 text-purple-800";
      case "interested":
        return "bg-yellow-100 text-yellow-800";
      case "discovery":
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200";
      default:
        return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200";
    }
  };

  const getPriorityColor = (priority: string | null | undefined) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredTenders = tenders.filter((tender) => {
    const matchesSearch =
      tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tender.client?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || tender.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Project Management & Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            Manage teams, resources, and track performance
          </p>
        </div>
        <button 
          onClick={() => setShowNewTenderModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 flex gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "projects"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <Users size={20} />
          Project Management
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "analytics"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <BarChart3 size={20} />
          Analytics & Performance
        </button>
      </div>

      {/* Integrations Status Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Integrations</h3>
          </div>
          <a 
            href="/integrations" 
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Manage All →
          </a>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {integrationService.getIntegrations().map((integration) => (
            <div
              key={integration.id}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                integration.status === 'connected'
                  ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                  : 'border-border bg-muted'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                integration.status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700-foreground truncate">
                  {integration.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {integration.status === 'connected' ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Connect external services to enhance your tender management workflow
          </p>
        </div>
      </div>

      {/* Project Management Tab */}
      {activeTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar - Project List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</h3>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="mb-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">All Stages</option>
                  <option value="discovery">Discovery</option>
                  <option value="interested">Interested</option>
                  <option value="working">Working</option>
                  <option value="submitted">Submitted</option>
                  <option value="closed">Closed</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-450px)] overflow-y-auto">
                {filteredTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTender?.id === tender.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500"
                    }`}
                    onClick={() => setSelectedTender(tender)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 flex-1">
                        {tender.autoExtractedTitle || tender.title}
                      </h3>
                      {tender.priority && (
                        <Star
                          className={`w-4 h-4 ml-2 flex-shrink-0 ${
                            tender.priority === "high"
                              ? "text-red-600 fill-red-600"
                              : tender.priority === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(tender.status)}
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          tender.status
                        )}`}
                      >
                        {tender.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                      <span>{tender.autoExtractedBudget || (tender.value ? `$${tender.value.toLocaleString()}` : "TBD")}</span>
                      {tender.teamMembers && tender.teamMembers.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{tender.teamMembers.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredTenders.length === 0 && (
                  <div className="text-center py-8 text-slate-600 dark:text-slate-300">
                    <Search size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                    <p className="text-sm">No projects found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Project Details */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTender ? (
              <>
                {/* Project Header */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {selectedTender.title}
                        </h2>
                        {selectedTender.priority && (
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              selectedTender.priority
                            )}`}
                          >
                            {selectedTender.priority.toUpperCase()} PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedTender.status)}
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            selectedTender.status
                          )}`}
                        >
                          {selectedTender.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit Project"
                    >
                      <Settings size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Value</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {selectedTender.autoExtractedBudget || (selectedTender.value ? `$${selectedTender.value.toLocaleString()}` : "TBD")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Win Probability</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {selectedTender.winProbability || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Deadline</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {selectedTender.autoExtractedDeadlines || (selectedTender.deadline
                            ? new Date(selectedTender.deadline).toLocaleDateString()
                            : "TBD")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Team Size</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {selectedTender.teamMembers?.length || 0} members
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Team Members
                    </h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowAddUserModal(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Create new team member in system"
                      >
                        <UserPlus size={16} />
                        New User
                      </button>
                      <button 
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        title="Assign existing user to this project"
                      >
                        <UserPlus size={16} />
                        Assign
                      </button>
                    </div>
                  </div>

                  {selectedTender.teamMembers && selectedTender.teamMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTender.teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {getInitials(member.user.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {member.user.name || member.user.email}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              {member.role}
                            </p>
                            {member.user.role && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                {member.user.role}
                              </p>
                            )}
                          </div>
                          <button 
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="p-1 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-600 dark:text-slate-300">
                      <Users size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm mb-4">No team members assigned yet</p>
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setShowAddUserModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Create New User
                        </button>
                        <button 
                          onClick={() => setShowAssignModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Assign Existing
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* External Links */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      External Resources
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selectedTender.oneDriveLink && (
                      <a
                        href={selectedTender.oneDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all group"
                      >
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            OneDrive Folder
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Project files and documents</p>
                        </div>
                        <ExternalLink size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                      </a>
                    )}

                    {selectedTender.googleDriveLink && (
                      <a
                        href={selectedTender.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-md hover:border-green-300 dark:hover:border-green-500 transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Google Drive Folder
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">Shared project resources</p>
                        </div>
                        <ExternalLink size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                      </a>
                    )}

                    {selectedTender.externalLinks && selectedTender.externalLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500 transition-all group"
                      >
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {link.label}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {link.description || link.type}
                          </p>
                        </div>
                        <ExternalLink size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      </a>
                    ))}

                    {!selectedTender.oneDriveLink &&
                      !selectedTender.googleDriveLink &&
                      (!selectedTender.externalLinks || selectedTender.externalLinks.length === 0) && (
                        <div className="text-center py-8 text-slate-600 dark:text-slate-300">
                          <ExternalLink size={32} className="mx-auto mb-2 text-slate-400 dark:text-slate-500" />
                          <p className="text-sm">No external links added yet</p>
                        </div>
                      )}
                  </div>
                </div>

                {/* Tags */}
                {selectedTender.tags && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Project Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTender.tags.split(",").map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
                        >
                          <Tag size={14} className="inline mr-1" />
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <Settings size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Select a Project
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Choose a project from the list to manage its team and resources
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && analyticsData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Win Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {(analyticsData.winRate || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Value</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    ${((analyticsData.totalValue || 0) / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Projects</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {analyticsData.activeTenders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {analyticsData.completedTenders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          {analyticsData.teamPerformance && Object.keys(analyticsData.teamPerformance).length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6">Team Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.teamPerformance)
                  .sort((a, b) => b[1].projects - a[1].projects)
                  .map(([name, data]) => {
                    const winRate = data.projects > 0 ? ((data.wins / data.projects) * 100).toFixed(1) : "0";
                    return (
                      <div
                        key={name}
                        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm">
                            {name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {name}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{data.projects} projects</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Win Rate</span>
                            <span
                              className={`font-semibold ${
                                parseFloat(winRate) >= 70
                                  ? "text-green-600"
                                  : parseFloat(winRate) >= 40
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {winRate}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Wins</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {data.wins}/{data.projects}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Total Value</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              ${(data.totalValue / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <NewTenderModal
        isOpen={showNewTenderModal}
        onClose={() => setShowNewTenderModal(false)}
        onSuccess={fetchData}
      />

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onSuccess={fetchData}
      />

      {selectedTender && (
        <>
          <AssignTeamModal
            isOpen={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            tenderId={selectedTender.id}
            tenderTitle={selectedTender.title}
            onSuccess={fetchData}
          />
          
          <EditProjectModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            projectId={selectedTender.id}
            currentData={{
              title: selectedTender.title,
              description: null,
              client: selectedTender.client,
              value: selectedTender.value,
              deadline: selectedTender.deadline,
              status: selectedTender.status,
              priority: selectedTender.priority,
              tags: selectedTender.tags,
              oneDriveLink: selectedTender.oneDriveLink,
              googleDriveLink: selectedTender.googleDriveLink,
            }}
            onSuccess={fetchData}
          />
        </>
      )}
    </div>
  );
}
