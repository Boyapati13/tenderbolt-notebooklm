"use client";

import { useState } from "react";
import clsx from "clsx";

const MODES = ["Analysis", "Collaboration", "Generation", "Review"] as const;
export type WorkMode = typeof MODES[number];

export function ModeSelector({ onChange }: { onChange?: (mode: WorkMode) => void }) {
  const [mode, setMode] = useState<WorkMode>("Analysis");

  return (
    <div className="inline-flex items-center gap-2 rounded-md border border-foreground/15 p-1 bg-black/5 dark:bg-white/5">
      {MODES.map((m) => (
        <button
          key={m}
          className={clsx(
            "px-3 py-1 text-sm rounded",
            mode === m ? "bg-foreground text-background" : "hover:bg-foreground/10"
          )}
          onClick={() => {
            setMode(m);
            onChange?.(m);
          }}
        >
          {m}
        </button>
      ))}
    </div>
  );
}


