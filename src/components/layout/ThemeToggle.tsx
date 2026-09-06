"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const THEMES = ["dark", "light"] as const;
type ThemeValue = (typeof THEMES)[number];

const themeConfig: Record<
  ThemeValue,
  {
    icon: React.FC<{ className?: string }>;
    label: string;
  }
> = {
  dark: { icon: Moon, label: "Dark" },
  light: { icon: Sun, label: "Light" },
};

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/5" />
    );
  }

  const currentTheme = theme as ThemeValue;
  const { icon: Icon, label } = themeConfig[currentTheme];

  const handleCycle = () => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={handleCycle}
      title={`Theme: ${label} - click to switch`}
      aria-label={`Current theme: ${label}. Click to switch theme.`}
      className="flex h-9 w-9 items-center justify-center rounded-xl
        border border-white/10 bg-white/5
        text-gray-400
        transition-colors
        hover:border-brand-500/30
        hover:bg-brand-500/10
        hover:text-brand-300
        dark:border-white/10
        dark:bg-white/5"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};