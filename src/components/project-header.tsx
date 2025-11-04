'use client';

import { ArrowLeft } from "lucide-react";

// Assuming the Project type is defined elsewhere and imported
type Project = {
  id: string;
  title: string;
  status: string;
  value?: number;
  createdAt: string;
  winProbability?: number;
};

export function ProjectHeader({ project, onBack }: { project: Project; onBack: () => void; }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": return "text-green-600 bg-green-100";
      case "lost": return "text-red-600 bg-red-100";
      case "active": return "text-blue-600 bg-blue-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
              <span className="text-sm text-gray-600">Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-sm text-gray-600">Win Probability</div>
            <div className={`text-2xl font-bold ${getWinProbabilityColor(project.winProbability || 0)}`}>
              {project.winProbability || 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Value</div>
            <div className="text-2xl font-bold text-gray-900">
              ${project.value?.toLocaleString() || 'TBD'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
