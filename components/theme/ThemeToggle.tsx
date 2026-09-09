"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded-xl bg-white/5" />;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-neutral-400 hover:text-white dark:hover:text-white hover:bg-neutral-800/60 dark:hover:bg-white/5 transition-all"
      title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
      aria-label="Toggle visual theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-300 hover:rotate-45 transition-transform duration-200" />
      ) : (
        <Moon className="w-4 h-4 text-neutral-700 hover:-rotate-12 transition-transform duration-200" />
      )}
    </button>
  );
}
