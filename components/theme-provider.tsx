"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("dark");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("uhc-theme") as Theme) || "dark";
    setThemeState(savedTheme);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    let targetTheme: "dark" | "light" = "dark";

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      targetTheme = prefersDark ? "dark" : "light";
    } else {
      targetTheme = theme;
    }

    setResolvedTheme(targetTheme);
    localStorage.setItem("uhc-theme", theme);

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(targetTheme);
    root.setAttribute("data-theme", targetTheme);
  }, [theme, mounted]);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
