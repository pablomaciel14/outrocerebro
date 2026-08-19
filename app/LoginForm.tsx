"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Não foi possível entrar.");
      window.location.href = "/dashboard";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return <form className="login-form" onSubmit={submit}>
    <label htmlFor="login-email">E-mail</label>
    <input id="login-email" type="email" autoComplete="email" inputMode="email" maxLength={254} spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} required />
    <label htmlFor="login-password">Senha</label>
    <div className="password-field">
      <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={512} value={password} onChange={(event) => setPassword(event.target.value)} required />
      <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} title={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff /> : <Eye />}</button>
    </div>
    <p className="login-error" role="alert" aria-live="polite">{error}</p>
    <button className="login-button" type="submit" disabled={loading}><span>{loading ? "Verificando…" : "Entrar no meu espaço"}</span><ArrowRight /></button>
  </form>;
}
