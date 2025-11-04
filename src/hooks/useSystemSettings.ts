"use client";

import { useEffect, useState } from 'react';

export type SystemSettings = {
  siteTitle: string;
  defaultLocale: string;
  enableIntegrations: boolean;
  maintenanceMode: boolean;
  backupCron: string;
};

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/system/settings')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.ok) setSettings(data.settings);
        else setError(data?.error || 'Failed to load settings');
      })
      .catch((e) => { setError(e?.message || String(e)); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, []);

  async function save(updated: Partial<SystemSettings>) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data?.ok) {
        setSettings(data.settings);
        return { ok: true, settings: data.settings };
      } else {
        setError(data?.error || 'Failed to save settings');
        return { ok: false, error: data?.error };
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return { ok: false, error: String(e) };
    } finally {
      setSaving(false);
    }
  }

  return { settings, loading, saving, error, save };
}
