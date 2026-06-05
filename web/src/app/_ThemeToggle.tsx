"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    try {
      localStorage.setItem("modul-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Сменить тему"
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card hover:bg-accent"
    >
      <span className="text-sm">{dark ? "☾" : "☀"}</span>
    </button>
  );
}
