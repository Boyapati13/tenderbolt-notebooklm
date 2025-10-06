"use client";

import { useEffect, useState } from "react";

type Stage = { id: string; name: string; order: number; status: string; dueDate?: string | null };
type Tender = { id: string; title: string; status: string; winProbability: number; dueDate?: string | null; stages: Stage[] };

export default function TenderDetail({ params }: { params: { id: string } }) {
  const [tender, setTender] = useState<Tender | null>(null);
  const [newStage, setNewStage] = useState("");

  useEffect(() => {
    fetch(`/api/tenders/${params.id}`).then((r) => r.json()).then((d) => setTender(d.tender));
  }, [params.id]);

  async function addStage() {
    await fetch(`/api/tenders/${params.id}/stages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newStage }) });
    const refreshed = await fetch(`/api/tenders/${params.id}`).then((r) => r.json());
    setTender(refreshed.tender);
    setNewStage("");
  }

  async function updateStage(stageId: string, patch: Partial<Stage>) {
    await fetch(`/api/stages/${stageId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const refreshed = await fetch(`/api/tenders/${params.id}`).then((r) => r.json());
    setTender(refreshed.tender);
  }

  async function deleteStage(stageId: string) {
    await fetch(`/api/stages/${stageId}`, { method: "DELETE" });
    const refreshed = await fetch(`/api/tenders/${params.id}`).then((r) => r.json());
    setTender(refreshed.tender);
  }

  async function updateTender(patch: Partial<Tender>) {
    await fetch(`/api/tenders/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const refreshed = await fetch(`/api/tenders/${params.id}`).then((r) => r.json());
    setTender(refreshed.tender);
  }

  if (!tender) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">{tender.title}</div>
          <div className="text-sm opacity-70">Status: {tender.status} · Win Prob: {tender.winProbability}%</div>
        </div>
        <div className="flex gap-2">
          <input className="rounded border border-foreground/20 bg-transparent px-3 py-2 w-40" placeholder="Win %" type="number" min={0} max={100}
            onChange={(e) => updateTender({ winProbability: Number(e.target.value) })}
          />
          <select className="rounded border border-foreground/20 bg-transparent px-3 py-2"
            onChange={(e) => updateTender({ status: e.target.value as any })}
            defaultValue={tender.status}
          >
            {['DRAFT','QUALIFICATION','PROPOSAL','NEGOTIATION','SUBMITTED','AWARDED','LOST'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-md border border-foreground/15 p-4">
        <div className="font-medium mb-2">Stages</div>
        <div className="flex gap-2 mb-3">
          <input className="rounded border border-foreground/20 bg-transparent px-3 py-2" placeholder="New stage name" value={newStage} onChange={(e) => setNewStage(e.target.value)} />
          <button className="rounded bg-foreground text-background px-3" onClick={addStage}>Add</button>
        </div>
        <ul className="space-y-2">
          {tender.stages.map((s) => (
            <li key={s.id} className="rounded border border-foreground/15 p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs opacity-70">{s.status}</div>
              </div>
              <div className="flex items-center gap-2">
                <select className="rounded border border-foreground/20 bg-transparent px-2 py-1 text-sm" defaultValue={s.status} onChange={(e) => updateStage(s.id, { status: e.target.value as any })}>
                  {['PENDING','IN_PROGRESS','COMPLETE'].map(st => <option key={st} value={st}>{st}</option>)}
                </select>
                <button className="text-xs underline opacity-70" onClick={() => deleteStage(s.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


