"use client";

import { useState } from "react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Save, RefreshCw } from "lucide-react";

export default function SystemSettingsPage() {
  const { settings, loading, saving, error, save } = useSystemSettings();
  const [local, setLocal] = useState<any>(null);

  // initialize local state when settings arrive
  if (!local && settings) setLocal(settings);

  const handleSave = async () => {
    if (!local) return;
    await save(local);
    // optionally show notification
  };

  if (loading || !local) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-6 bg-muted rounded w-1/4 mb-4" />
        <div className="h-48 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">System Settings</h1>
            <p className="text-muted-foreground">Global configuration for system behavior</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
              onClick={async () => { window.location.reload(); }}
              title="Reload"
            >
              <RefreshCw />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block mb-4">
            <div className="text-sm font-medium mb-1">Site title</div>
            <input
              value={local.siteTitle}
              onChange={(e) => setLocal({ ...local, siteTitle: e.target.value })}
              className="w-full input"
            />
          </label>

          <label className="block mb-4">
            <div className="text-sm font-medium mb-1">Default locale</div>
            <input
              value={local.defaultLocale}
              onChange={(e) => setLocal({ ...local, defaultLocale: e.target.value })}
              className="w-40 input"
            />
          </label>

          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={!!local.enableIntegrations}
              onChange={(e) => setLocal({ ...local, enableIntegrations: e.target.checked })}
            />
            <span>Enable integrations</span>
          </label>

          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={!!local.maintenanceMode}
              onChange={(e) => setLocal({ ...local, maintenanceMode: e.target.checked })}
            />
            <span>Maintenance mode</span>
          </label>

          <label className="block mb-4">
            <div className="text-sm font-medium mb-1">Backup cron (crontab)</div>
            <input
              value={local.backupCron}
              onChange={(e) => setLocal({ ...local, backupCron: e.target.value })}
              className="w-full input"
            />
            <p className="text-xs text-gray-500 mt-1">Default: <code>0 2 * * *</code></p>
          </label>
        </div>
      </div>
    </div>
  );
}
