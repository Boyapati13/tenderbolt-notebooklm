"use client";

import { useEffect, useState } from "react";

type Tender = {
  id: string;
  title: string;
  status: string;
  winProbability: number;
  dueDate?: string | null;
};

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((d) => setTenders(d.tenders ?? []));
  }, []);

  async function createTender() {
    const res = await fetch("/api/tenders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const data = await res.json();
    setTenders((t) => [data.tender, ...t]);
    setTitle("");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="rounded border border-foreground/20 bg-transparent px-3 py-2"
          placeholder="New tender title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-foreground text-background px-3" onClick={createTender}>
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {tenders.map((t) => (
          <li key={t.id} className="rounded border border-foreground/15 p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">
                <a href={`/en/tenders/${t.id}`} className="hover:underline">{t.title}</a>
              </div>
              <div className="text-xs opacity-70">{t.status} · Win Prob: {t.winProbability}%</div>
            </div>
            <div className="text-xs opacity-70">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}


