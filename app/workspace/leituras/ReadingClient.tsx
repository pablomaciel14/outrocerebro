"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Status = "wishlist" | "reading" | "read";
type Reading = {
  id: string; title: string; fileName: string; markdown: string; status: Status;
  currentPage: number; totalPages: number; totalSeconds: number; updatedAt: string;
};

const statusLabels: Record<Status, string> = { wishlist: "Desejo ler", reading: "Lendo", read: "Já lido" };

function formatTime(total: number) {
  const hours = Math.floor(total / 3600).toString().padStart(2, "0");
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = Math.floor(total % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function linkify(text: string) {
  return text.replace(/(https?:\/\/[^\s<>]+)/g, (url) => `[${url}](${url})`);
}

async function extractMarkdown(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const title = file.name.replace(/\.pdf$/i, "");
  const sections = [`# ${title}`, "", `> Importado para o Outro Cérebro em ${new Date().toLocaleDateString("pt-BR")}.`, ""];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items.map((item) => ("str" in item ? item.str : "")).join(" ").replace(/\s+/g, " ").trim();
    sections.push(`## Página ${pageNumber}`, "", text ? linkify(text) : "_Página sem texto extraível. O arquivo pode ser digitalizado._", "");
  }
  return { markdown: sections.join("\n"), totalPages: document.numPages, title };
}

function MarkdownView({ markdown }: { markdown: string }) {
  return <div className="markdown-view">{markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) return <h1 key={index}>{line.slice(2)}</h1>;
    if (line.startsWith("## ")) return <h2 key={index}>{line.slice(3)}</h2>;
    if (line.startsWith("> ")) return <blockquote key={index}>{line.slice(2)}</blockquote>;
    const parts = line.split(/(https?:\/\/[^\s\])]+)/g);
    return <p key={index}>{parts.map((part, partIndex) => part.startsWith("http") ? <a key={partIndex} href={part} target="_blank" rel="noreferrer">{part}</a> : part.replace(/\[|\]|\(|\)/g, ""))}</p>;
  })}</div>;
}

function PdfCanvas({ reading, page, onLoaded }: { reading: Reading; page: number; onLoaded: (count: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let task: { destroy(): Promise<void> } | undefined;
    (async () => {
      try {
        setError("");
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const response = await fetch(`/api/readings?file=${encodeURIComponent(reading.id)}`);
        if (!response.ok) throw new Error("Não foi possível abrir o arquivo.");
        const data = await response.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data });
        task = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        onLoaded(pdf.numPages);
        const pdfPage = await pdf.getPage(Math.min(page, pdf.numPages));
        const viewport = pdfPage.getViewport({ scale: 1.45 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) return;
        await pdfPage.render({ canvasContext: context, canvas, viewport }).promise;
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Falha ao renderizar PDF.");
      }
    })();
    return () => { cancelled = true; task?.destroy().catch(() => undefined); };
  }, [reading.id, page, onLoaded]);

  if (error) return <div className="reader-error">{error}</div>;
  return <canvas ref={canvasRef} className="pdf-canvas" aria-label={`Página ${page} de ${reading.title}`} />;
}

export default function ReadingClient() {
  const [items, setItems] = useState<Reading[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [tab, setTab] = useState<"pdf" | "markdown" | "graph">("pdf");
  const [running, setRunning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Carregando biblioteca...");
  const [lightMode, setLightMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Reading[]>([]);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { setLightMode(window.localStorage.getItem("outro-cerebro-reading-theme") === "light"); }, []);

  const toggleTheme = () => {
    setLightMode((current) => {
      const next = !current;
      window.localStorage.setItem("outro-cerebro-reading-theme", next ? "light" : "dark");
      return next;
    });
  };

  const refresh = useCallback(async () => {
    const response = await fetch("/api/readings", { cache: "no-store" });
    if (!response.ok) { setMessage("Não foi possível carregar sua biblioteca."); return; }
    const data = await response.json() as { readings: Reading[] };
    setItems(data.readings); setMessage(data.readings.length ? "" : "Sua biblioteca ainda está vazia.");
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const persist = useCallback(async (id: string, changes: Partial<Pick<Reading, "status" | "currentPage" | "totalSeconds">>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
    await fetch("/api/readings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...changes }), keepalive: true });
  }, []);

  useEffect(() => {
    if (!running || !selectedId) return;
    const interval = window.setInterval(() => {
      setItems((current) => current.map((item) => item.id === selectedId ? { ...item, totalSeconds: item.totalSeconds + 1 } : item));
    }, 1000);
    const sync = window.setInterval(() => {
      const current = itemsRef.current.find((item) => item.id === selectedId);
      if (current) persist(current.id, { totalSeconds: current.totalSeconds });
    }, 10000);
    return () => { window.clearInterval(interval); window.clearInterval(sync); };
  }, [running, selectedId, persist]);

  const onUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") { setMessage("Selecione um arquivo PDF."); return; }
    try {
      setUploading(true); setMessage("Lendo o PDF e criando o Markdown...");
      const extracted = await extractMarkdown(file);
      const form = new FormData();
      form.set("file", file); form.set("title", extracted.title); form.set("markdown", extracted.markdown); form.set("totalPages", String(extracted.totalPages));
      const response = await fetch("/api/readings", { method: "POST", body: form });
      const data = await response.json() as { reading?: Reading; error?: string };
      if (!response.ok || !data.reading) throw new Error(data.error ?? "Falha no upload.");
      setItems((current) => [data.reading!, ...current]); setSelectedId(data.reading.id); setTab("pdf"); setMessage("");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível importar o PDF."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  };

  const filtered = items.filter((item) => filter === "all" || item.status === filter);
  const domains = useMemo(() => {
    if (!selected) return [];
    const urls = selected.markdown.match(/https?:\/\/[^\s\])]+/g) ?? [];
    return Array.from(new Set(urls.map((url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "link"; } }))).slice(0, 6);
  }, [selected]);

  const changePage = (next: number) => {
    if (!selected) return;
    const page = Math.max(1, Math.min(selected.totalPages, next));
    persist(selected.id, { currentPage: page, status: selected.status === "wishlist" ? "reading" : selected.status });
  };

  return (
    <main className={lightMode ? "reading-shell light-reading" : "reading-shell"}>
      <header className="reading-topbar">
        <a href="/workspace" className="reading-brand"><span>∞</span><b>Outro Cérebro</b></a>
        <div><span className="saved-indicator">● Progresso salvo</span><button className="theme-toggle" onClick={toggleTheme} aria-pressed={lightMode} aria-label="Alternar tema de leitura"><span>{lightMode ? "☾" : "☀"}</span>{lightMode ? "Modo escuro" : "Modo claro"}</button><a href="/workspace">Voltar às notas</a></div>
      </header>
      <aside className="library-panel">
        <div className="library-title"><div><small>BIBLIOTECA PESSOAL</small><h1>Minhas leituras</h1></div><span>{items.length}</span></div>
        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(event) => onUpload(event.target.files?.[0])} />
        <button className="upload-pdf" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? "Processando…" : "＋  Adicionar PDF"}</button>
        <div className="reading-filters">
          {(["all", "reading", "wishlist", "read"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "Todos" : statusLabels[value]}</button>)}
        </div>
        <div className="library-list">
          {filtered.map((item) => {
            const progress = Math.round((item.currentPage / item.totalPages) * 100);
            return <button key={item.id} className={item.id === selectedId ? "library-item active" : "library-item"} onClick={() => { setSelectedId(item.id); setTab("pdf"); }}>
              <i>PDF</i><span><b>{item.title}</b><small>{statusLabels[item.status]} · pág. {item.currentPage}/{item.totalPages}</small><em><u style={{ width: `${progress}%` }} /></em></span>
            </button>;
          })}
          {message && <p className="library-message">{message}</p>}
        </div>
        <div className="library-private"><span>♙</span><p>Biblioteca privada<small>Arquivos e progresso visíveis apenas para você.</small></p></div>
      </aside>

      {!selected ? <section className="reading-empty">
        <div className="empty-icon">PDF</div><h2>Sua sala de leitura</h2><p>Adicione um PDF para transformar a leitura em memória: texto em Markdown, links, conexões, tempo e progresso.</p><button onClick={() => inputRef.current?.click()}>Escolher primeiro PDF</button>
        <div className="feature-row"><span>◫<b>Retome da página</b></span><span>◷<b>Registre seu tempo</b></span><span>⌘<b>Conecte ideias</b></span></div>
      </section> : <>
        <section className="reader-stage">
          <div className="reader-heading">
            <div><small>{statusLabels[selected.status]}</small><h1>{selected.title}</h1></div>
            <select value={selected.status} onChange={(event) => persist(selected.id, { status: event.target.value as Status })} aria-label="Estado da leitura">
              <option value="wishlist">Desejo ler</option><option value="reading">Lendo</option><option value="read">Já lido</option>
            </select>
          </div>
          <div className="reader-tabs"><button className={tab === "pdf" ? "active" : ""} onClick={() => setTab("pdf")}>PDF</button><button className={tab === "markdown" ? "active" : ""} onClick={() => setTab("markdown")}>Markdown</button><button className={tab === "graph" ? "active" : ""} onClick={() => setTab("graph")}>Conexões</button></div>
          <div className="document-stage">
            {tab === "pdf" && <PdfCanvas reading={selected} page={selected.currentPage} onLoaded={(count) => count !== selected.totalPages && setItems((current) => current.map((item) => item.id === selected.id ? { ...item, totalPages: count } : item))} />}
            {tab === "markdown" && <MarkdownView markdown={selected.markdown} />}
            {tab === "graph" && <div className="reading-graph"><div className="graph-center">{selected.title.slice(0, 32)}</div>{(domains.length ? domains : ["Sem links externos"]).map((domain, index) => <div key={domain} className={`domain-node domain-${index + 1}`}>{domain}</div>)}</div>}
          </div>
          <div className="page-controls"><button disabled={selected.currentPage <= 1} onClick={() => changePage(selected.currentPage - 1)}>← Anterior</button><span>Página <b>{selected.currentPage}</b> de {selected.totalPages}</span><button disabled={selected.currentPage >= selected.totalPages} onClick={() => changePage(selected.currentPage + 1)}>Próxima →</button></div>
        </section>
        <aside className="reading-session">
          <small>SESSÃO DE LEITURA</small><div className={running ? "timer running" : "timer"}>{formatTime(selected.totalSeconds)}</div><p>Tempo total registrado</p>
          <button className={running ? "timer-button pause" : "timer-button"} onClick={() => { if (running) persist(selected.id, { totalSeconds: selected.totalSeconds }); else if (selected.status === "wishlist") persist(selected.id, { status: "reading" }); setRunning((value) => !value); }}>{running ? "Ⅱ  Pausar cronômetro" : "▶  Iniciar cronômetro"}</button>
          <div className="session-stats"><span><b>{Math.round((selected.currentPage / selected.totalPages) * 100)}%</b>progresso</span><span><b>{selected.totalPages - selected.currentPage}</b>páginas restantes</span></div>
          <div className="resume-card"><span>↗</span><p><b>Retomada automática</b>Ao reabrir, você continuará na página {selected.currentPage}.</p></div>
          <button className="mark-read" onClick={() => persist(selected.id, { status: selected.status === "read" ? "reading" : "read" })}>{selected.status === "read" ? "↶ Voltar para Lendo" : "✓ Marcar como já lido"}</button>
          <div className="markdown-summary"><small>REGISTRO CRIADO</small><p><span>#</span> {selected.title}</p><p><span>##</span> {selected.totalPages} páginas em Markdown</p><p><span>↗</span> {domains.length} links conectados</p></div>
        </aside>
      </>}
    </main>
  );
}
