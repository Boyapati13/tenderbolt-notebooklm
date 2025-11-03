'use client';

import { useState } from 'react';
import {
  Brain,
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useInsights, Insight } from '../hooks/useInsights';

const insightConfig: { [key in Insight['type']]: { icon: JSX.Element; color: string; } } = {
  requirement: { icon: <FileText size={16} />, color: 'border-blue-400' },
  compliance: { icon: <CheckCircle size={16} />, color: 'border-green-400' },
  risk: { icon: <AlertTriangle size={16} />, color: 'border-red-400' },
  deadline: { icon: <Calendar size={16} />, color: 'border-orange-400' },
};

type InsightTypeFilter = Insight['type'] | 'all';

export function InsightsPanel({ projectId }: { projectId?: string }) {
  const [filter, setFilter] = useState<InsightTypeFilter>('all');
  const { insights, isLoading, isError } = useInsights(projectId);

  const filteredInsights = insights.filter(
    (insight) => filter === 'all' || insight.type === filter
  );

  const insightCounts = {
    all: insights.length,
    requirement: insights.filter((i) => i.type === 'requirement').length,
    compliance: insights.filter((i) => i.type === 'compliance').length,
    risk: insights.filter((i) => i.type === 'risk').length,
    deadline: insights.filter((i) => i.type === 'deadline').length,
  };

  return (
    <div className="h-full flex flex-col p-3 text-white space-y-3">
      <FilterTabs filter={filter} setFilter={setFilter} counts={insightCounts} />

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState />
      ) : (
        <InsightsList insights={filteredInsights} allInsightsCount={insights.length} filter={filter} />
      )}
    </div>
  );
}

// Sub-components

const FilterTabs = ({ filter, setFilter, counts }: any) => (
  <div className="flex gap-2 overflow-x-auto pb-2">
    <FilterButton label="All" type="all" activeFilter={filter} onClick={setFilter} count={counts.all} />
    <FilterButton label="Requirements" type="requirement" activeFilter={filter} onClick={setFilter} count={counts.requirement} />
    <FilterButton label="Compliance" type="compliance" activeFilter={filter} onClick={setFilter} count={counts.compliance} />
    <FilterButton label="Risks" type="risk" activeFilter={filter} onClick={setFilter} count={counts.risk} />
    <FilterButton label="Deadlines" type="deadline" activeFilter={filter} onClick={setFilter} count={counts.deadline} />
  </div>
);

const FilterButton = ({ label, type, activeFilter, onClick, count }: any) => (
  <button
    onClick={() => onClick(type)}
    className={`flex-shrink-0 px-3 py-1 text-xs font-medium rounded-full transition-colors ${
      activeFilter === type
        ? 'bg-slate-600/80 text-white'
        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80'
    }`}
  >
    {label} <span className="font-mono text-slate-500">({count})</span>
  </button>
);

const InsightsList = ({ insights, allInsightsCount, filter }: { insights: Insight[], allInsightsCount: number, filter: InsightTypeFilter }) => {
  if (insights.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
        <Zap size={32} className="mb-3 text-slate-600" />
        <p className="text-sm font-medium">
          {allInsightsCount === 0
            ? "No insights generated yet."
            : `No ${filter} insights found.`}
        </p>
        <p className="text-xs mt-1">
            {allInsightsCount === 0 ? "Analyze documents to find insights." : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 overflow-auto pr-1">
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
};

const InsightCard = ({ insight }: { insight: Insight }) => {
  const config = insightConfig[insight.type];

  return (
    <div className={`p-3 rounded-lg border-l-4 bg-slate-800/60 backdrop-blur-sm ${config.color}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 mt-0.5 text-slate-300`}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
            {insight.type}
          </div>
          <p className="text-sm text-slate-200 mb-2">{insight.content}</p>
          {insight.citation && (
            <p className="text-xs text-slate-500 font-mono">Source: {insight.citation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="p-4 flex items-center justify-center text-slate-400">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400"></div>
    <p className="ml-3">Loading insights...</p>
  </div>
);

const ErrorState = () => (
    <div className="text-center py-10 text-red-400 flex flex-col items-center justify-center">
        <AlertTriangle size={24} className="mb-2" />
        <p className="text-sm">Failed to load insights.</p>
    </div>
);
