"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@coss/ui/icons";
import { useGbmTheme } from "./ThemeProvider";
import type { GbmTheme } from "./ThemeProvider";

const options: { value: GbmTheme; icon: React.ReactNode; label: string }[] = [
  { value: "light", icon: <SunIcon className="h-3.5 w-3.5" />, label: "Light" },
  { value: "dark", icon: <MoonIcon className="h-3.5 w-3.5" />, label: "Dark" },
  { value: "system", icon: <MonitorIcon className="h-3.5 w-3.5" />, label: "System" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useGbmTheme();

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-900 ${className ?? ""}`}>
      {options.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          aria-label={`Switch to ${label} mode`}
          className={`rounded-full p-1.5 transition-colors ${
            theme === value
              ? "bg-orange-500 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}>
          {icon}
        </button>
      ))}
    </div>
  );
}
