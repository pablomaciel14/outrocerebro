"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "outro-cerebro-reading-theme";
const THEME_EVENT = "outro-cerebro-theme";

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function currentTheme() {
  return window.localStorage.getItem(THEME_KEY) === "light";
}

export default function ThemeToggle({ variant = "full" }: { variant?: "full" | "icon" | "floating" }) {
  const light = useSyncExternalStore(subscribeTheme, currentTheme, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("system-light", light);
  }, [light]);

  const toggle = () => {
    const next = !light;
    window.localStorage.setItem(THEME_KEY, next ? "light" : "dark");
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next ? "light" : "dark" }));
  };

  return (
    <button className={`theme-toggle theme-${variant}`} onClick={toggle} aria-pressed={light} aria-label={light ? "Ativar modo escuro" : "Ativar modo claro"} title={light ? "Modo escuro" : "Modo claro"}>
      <span aria-hidden="true">{light ? <Moon /> : <Sun />}</span>{variant === "full" && (light ? "Modo escuro" : "Modo claro")}
    </button>
  );
}
