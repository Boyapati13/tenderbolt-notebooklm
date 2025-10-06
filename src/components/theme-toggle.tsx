"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
        disabled
      >
        <div className="w-4 h-4" />
        <span>Theme</span>
      </button>
    );
  }

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle theme"
      className="inline-flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors focus-ring"
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      <span className="font-medium">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}


