import { useState } from "react";
import { ProjectWorkspace } from "./project-workspace";
import { CrmDashboard } from "./crm-dashboard";

const MODES = ["Analysis", "CRM"] as const;
type Mode = typeof MODES[number];

export function ModeSelector({ 
  projectId 
}: { 
  projectId: string;
}) {
  const [mode, setMode] = useState<Mode>("Analysis");

  return (
    <div className="h-full w-full flex flex-col">
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-md border border-gray-300 dark:border-slate-600 p-1 bg-white/5 dark:bg-black/5">
            {MODES.map((m) => (
              <button
                key={m}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  mode === m
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                }`}
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {mode === "Analysis" && <ProjectWorkspace projectId={projectId} />}
        {mode === "CRM" && <CrmDashboard />}
      </div>
    </div>
  );
}
