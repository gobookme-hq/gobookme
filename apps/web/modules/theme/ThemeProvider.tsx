"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type GbmTheme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: GbmTheme;
  setTheme: (t: GbmTheme) => void;
  /** True when dark colors should be applied (respects system pref for 'system' mode) */
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeInternal] = useState<GbmTheme>("dark");
  const [systemIsDark, setSystemIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mq.addEventListener("change", handler);

    const saved = localStorage.getItem("gbm-theme") as GbmTheme | null;
    if (saved && ["dark", "light", "system"].includes(saved)) {
      setThemeInternal(saved);
    }
    setMounted(true);

    return () => mq.removeEventListener("change", handler);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemIsDark);

  const setTheme = (t: GbmTheme) => {
    setThemeInternal(t);
    localStorage.setItem("gbm-theme", t);
  };

  useEffect(() => {
    if (!mounted) return;
    // Apply to document root so portals (dialogs, modals) inherit the correct theme
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);

  // Render with dark class by default to match SSR; suppress the attribute mismatch warning.
  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useGbmTheme = () => useContext(ThemeContext);
