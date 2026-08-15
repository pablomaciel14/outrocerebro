"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "../../ThemeToggle";

type Status = "wishlist" | "reading" | "read";
type Reading = {
  id: string; title: string; fileName: string; markdown: string; status: Status;
  currentPage: number; totalPages: number; totalSeconds: number; updatedAt: string;
};
type HighlightColor = "yellow" | "green" | "blue" | "pink" | "violet";
type Highlight = { id: string; readingId: string; source: "pdf" | "markdown"; page: number | null; quote: string; color: HighlightColor; note: string; createdAt: string };
type PendingHighlight = { quote: string; source: "pdf" | "markdown"; page: number | null };

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
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
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

function plainWithLinks(text: string, keyPrefix: string) {
  return text.split(/(https?:\/\/[^\s\])]+)/g).map((part, index) => part.startsWith("http")
    ? <a key={`${keyPrefix}-${index}`} href={part} target="_blank" rel="noreferrer">{part}</a>
    : part.replace(/\[|\]|\(|\)/g, ""));
}

function highlightedLine(text: string, highlights: Highlight[], keyPrefix: string) {
  const matches = highlights.map((highlight) => ({ highlight, start: text.indexOf(highlight.quote) }))
    .filter((match) => match.start >= 0).sort((a, b) => a.start - b.start);
  if (!matches.length) return plainWithLinks(text, keyPrefix);
  const output: React.ReactNode[] = [];
  let cursor = 0;
  matches.forEach(({ highlight, start }, index) => {
    if (start < cursor) return;
    output.push(...plainWithLinks(text.slice(cursor, start), `${keyPrefix}-pre-${index}`));
    output.push(<mark key={`${keyPrefix}-mark-${index}`} className={`text-highlight highlight-${highlight.color}`} title={highlight.note || "Trecho destacado"}>{highlight.quote}</mark>);
    cursor = start + highlight.quote.length;
  });
  output.push(...plainWithLinks(text.slice(cursor), `${keyPrefix}-tail`));
  return output;
}

function MarkdownView({ markdown, highlights }: { markdown: string; highlights: Highlight[] }) {
  return <div className="markdown-view">{markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) return <h1 key={index}>{highlightedLine(line.slice(2), highlights, `h1-${index}`)}</h1>;
    if (line.startsWith("## ")) return <h2 key={index}>{highlightedLine(line.slice(3), highlights, `h2-${index}`)}</h2>;
    if (line.startsWith("> ")) return <blockquote key={index}>{highlightedLine(line.slice(2), highlights, `bq-${index}`)}</blockquote>;
    return <p key={index}>{highlightedLine(line, highlights, `p-${index}`)}</p>;
  })}</div>;
}

function PdfCanvas({ reading, page, highlights, onLoaded }: { reading: Reading; page: number; highlights: Highlight[]; onLoaded: (count: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let task: { destroy(): Promise<void> } | undefined;
    (async () => {
      try {
        setError("");
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
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
        const textLayerContainer = textLayerRef.current;
        if (textLayerContainer && !cancelled) {
          textLayerContainer.replaceChildren();
          textLayerContainer.style.setProperty("--scale-factor", String(viewport.scale));
          const textLayer = new pdfjs.TextLayer({ textContentSource: await pdfPage.getTextContent(), container: textLayerContainer, viewport });
          await textLayer.render();
          const pageHighlights = highlights.filter((highlight) => highlight.source === "pdf" && highlight.page === page);
          textLayerContainer.querySelectorAll("span").forEach((span) => {
            const hit = pageHighlights.find((highlight) => span.textContent?.includes(highlight.quote));
            if (hit) span.classList.add("pdf-highlight", `highlight-${hit.color}`);
          });
        }
      } catch (reason) {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Falha ao renderizar PDF.");
      }
    })();
    return () => { cancelled = true; task?.destroy().catch(() => undefined); };
  }, [reading.id, page, highlights, onLoaded]);

  if (error) return <div className="reader-error">{error}</div>;
  return <div className="pdf-page-wrap" data-highlight-source="pdf" data-highlight-page={page}><canvas ref={canvasRef} className="pdf-canvas" aria-label={`Página ${page} de ${reading.title}`} /><div ref={textLayerRef} className="textLayer pdf-text-layer" /></div>;
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
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [pendingHighlight, setPendingHighlight] = useState<PendingHighlight | null>(null);
  const [highlightColor, setHighlightColor] = useState<HighlightColor>("yellow");
  const [highlightNote, setHighlightNote] = useState("");
  const [savingHighlight, setSavingHighlight] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Reading[]>([]);
  const documentStageRef = useRef<HTMLDivElement>(null);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => {
    setLightMode(window.localStorage.getItem("outro-cerebro-reading-theme") === "light");
    const sync = (event: Event) => setLightMode((event as CustomEvent<string>).detail === "light");
    window.addEventListener("outro-cerebro-theme", sync);
    return () => window.removeEventListener("outro-cerebro-theme", sync);
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/readings", { cache: "no-store" });
    if (!response.ok) { setMessage("Não foi possível carregar sua biblioteca."); return; }
    const data = await response.json() as { readings: Reading[] };
    setItems(data.readings); setMessage(data.readings.length ? "" : "Sua biblioteca ainda está vazia.");
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!selectedId) { setHighlights([]); return; }
    let cancelled = false;
    fetch(`/api/highlights?readingId=${encodeURIComponent(selectedId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Falha ao carregar destaques")))
      .then((data: { highlights: Highlight[] }) => { if (!cancelled) setHighlights(data.highlights); })
      .catch(() => { if (!cancelled) setHighlights([]); });
    return () => { cancelled = true; };
  }, [selectedId]);

  const captureSelection = () => {
    const selection = window.getSelection();
    const stage = documentStageRef.current;
    if (!selection || selection.isCollapsed || !stage || !selection.anchorNode || !stage.contains(selection.anchorNode)) return;
    const quote = selection.toString().replace(/\s+/g, " ").trim();
    if (quote.length < 2) return;
    const element = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode as Element : selection.anchorNode.parentElement;
    const pdfPage = element?.closest<HTMLElement>("[data-highlight-source='pdf']");
    setPendingHighlight({ quote: quote.slice(0, 3000), source: tab === "pdf" ? "pdf" : "markdown", page: pdfPage ? Number(pdfPage.dataset.highlightPage) : null });
    setHighlightNote("");
  };

  const saveHighlight = async () => {
    if (!selected || !pendingHighlight) return;
    setSavingHighlight(true);
    try {
      const response = await fetch("/api/highlights", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ readingId: selected.id, ...pendingHighlight, color: highlightColor, note: highlightNote }) });
      const data = await response.json() as { highlight?: Highlight; error?: string };
      if (!response.ok || !data.highlight) throw new Error(data.error ?? "Não foi possível salvar o destaque.");
      setHighlights((current) => [data.highlight!, ...current]); setPendingHighlight(null); setHighlightNote(""); window.getSelection()?.removeAllRanges();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Não foi possível salvar o destaque."); }
    finally { setSavingHighlight(false); }
  };

  const deleteHighlight = async (id: string) => {
    const response = await fetch(`/api/highlights?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setHighlights((current) => current.filter((highlight) => highlight.id !== id));
  };

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
        <div><span className="saved-indicator">● Progresso salvo</span><ThemeToggle /><a href="/workspace">Voltar às notas</a></div>
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
          <div ref={documentStageRef} className="document-stage" onMouseUp={captureSelection}>
            {tab === "pdf" && <PdfCanvas reading={selected} page={selected.currentPage} highlights={highlights} onLoaded={(count) => count !== selected.totalPages && setItems((current) => current.map((item) => item.id === selected.id ? { ...item, totalPages: count } : item))} />}
            {tab === "markdown" && <div data-highlight-source="markdown"><MarkdownView markdown={selected.markdown} highlights={highlights.filter((highlight) => highlight.source === "markdown")} /></div>}
            {tab === "graph" && <div className="reading-graph"><div className="graph-center">{selected.title.slice(0, 32)}</div>{(domains.length ? domains : ["Sem links externos"]).map((domain, index) => <div key={domain} className={`domain-node domain-${index + 1}`}>{domain}</div>)}</div>}
            {pendingHighlight && <div className="highlight-composer" onMouseUp={(event) => event.stopPropagation()}>
              <div className="selected-quote">“{pendingHighlight.quote.slice(0, 180)}{pendingHighlight.quote.length > 180 ? "…" : ""}”</div>
              <div className="highlight-palette">
                {(["yellow", "green", "blue", "pink", "violet"] as HighlightColor[]).map((color) => <button key={color} className={`color-dot highlight-${color} ${highlightColor === color ? "active" : ""}`} onClick={() => setHighlightColor(color)} aria-label={`Destaque ${color}`} />)}
              </div>
              <textarea value={highlightNote} onChange={(event) => setHighlightNote(event.target.value)} placeholder="Adicionar uma nota a este trecho (opcional)…" aria-label="Nota do destaque" />
              <div className="highlight-actions"><button onClick={() => setPendingHighlight(null)}>Cancelar</button><button className="save" disabled={savingHighlight} onClick={saveHighlight}>{savingHighlight ? "Salvando…" : "Destacar"}</button></div>
            </div>}
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
          <div className="annotations-panel"><div className="annotations-heading"><small>DESTAQUES E NOTAS</small><b>{highlights.length}</b></div>
            <p className="annotations-help">Selecione um trecho no PDF ou Markdown para destacar.</p>
            <div className="annotations-list">{highlights.map((highlight) => <article key={highlight.id} className={`annotation-card annotation-${highlight.color}`}>
              <div><i className={`color-dot highlight-${highlight.color}`} /><small>{highlight.source === "pdf" ? `PDF · página ${highlight.page}` : "Markdown"}</small><button onClick={() => deleteHighlight(highlight.id)} aria-label="Excluir destaque">×</button></div>
              <blockquote>“{highlight.quote}”</blockquote>{highlight.note && <p>{highlight.note}</p>}
            </article>)}</div>
          </div>
        </aside>
      </>}
    </main>
  );
}
