import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'system-settings.json');

const DEFAULT_SETTINGS = {
  siteTitle: 'HandsOn AI',
  defaultLocale: 'en',
  enableIntegrations: true,
  maintenanceMode: false,
  backupCron: '0 2 * * *'
};

async function ensureDataDir() {
  const dir = path.dirname(SETTINGS_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

async function readSettings() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(obj: any) {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    console.error('GET /api/system/settings error', error);
    return NextResponse.json({ ok: false, error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const current = await readSettings();
    const merged = { ...current, ...body };
    await writeSettings(merged);
    return NextResponse.json({ ok: true, settings: merged });
  } catch (error) {
    console.error('PUT /api/system/settings error', error);
    return NextResponse.json({ ok: false, error: 'Failed to write settings' }, { status: 500 });
  }
}
