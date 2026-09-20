import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "warrantify-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function readStored(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
}

/**
 * Single source of truth for the active theme: state drives the html class,
 * and the stored value is re-read on mount so the toggle can never drift.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = readStored();
    setTheme(stored);
    apply(stored);

    const syncAcrossTabs = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next = event.newValue === "light" ? "light" : "dark";
      setTheme(next);
      apply(next);
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const set = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    set(readStored() === "light" ? "dark" : "light");
  }, [set]);

  return { theme, setTheme: set, toggleTheme: toggle, isDark: theme === "dark" };
}
