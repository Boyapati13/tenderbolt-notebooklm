"use client";

import { IntegrationsPanel } from "@/components/integrations-panel";

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <IntegrationsPanel />
      </div>
    </div>
  );
}
