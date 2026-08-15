"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "outro-cerebro-reading-theme";

export default function ThemeToggle({ variant = "full" }: { variant?: "full" | "icon" | "floating" }) {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const isLight = window.localStorage.getItem(THEME_KEY) === "light";
    setLight(isLight);
    document.documentElement.classList.toggle("system-light", isLight);
  }, []);

  const toggle = () => {
    setLight((current) => {
      const next = !current;
      window.localStorage.setItem(THEME_KEY, next ? "light" : "dark");
      document.documentElement.classList.toggle("system-light", next);
      window.dispatchEvent(new CustomEvent("outro-cerebro-theme", { detail: next ? "light" : "dark" }));
      return next;
    });
  };

  return (
    <button className={`theme-toggle theme-${variant}`} onClick={toggle} aria-pressed={light} aria-label={light ? "Ativar modo escuro" : "Ativar modo claro"} title={light ? "Modo escuro" : "Modo claro"}>
      <span>{light ? "☾" : "☀"}</span>{variant === "full" && (light ? "Modo escuro" : "Modo claro")}
    </button>
  );
}
