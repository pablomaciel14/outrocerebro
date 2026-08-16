"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bookmark, BookOpenText, Check, ChevronLeft, ChevronRight, Columns2, ExternalLink, FileCode2, FileText, Focus, GitBranch, History, LockKeyhole, Maximize2, Minimize2, Network, Pause, Play, Search, Settings2, Timer, Trash2, Upload, ZoomIn, ZoomOut } from "lucide-react";
import ThemeToggle from "../../ThemeToggle";

type Status = "wishlist" | "reading" | "read";
type Reading = {
  id: string; title: string; fileName: string; markdown: string; status: Status;
  currentPage: number; totalPages: number; totalSeconds: number; updatedAt: string;
};
type HighlightColor = "yellow" | "green" | "blue" | "pink" | "violet";
type HighlightRect = { x: number; y: number; width: number; height: number };
type Highlight = { id: string; readingId: string; source: "pdf" | "markdown"; page: number | null; quote: string; color: HighlightColor; note: string; rects: string; createdAt: string };
type PendingHighlight = { quote: string; source: "pdf" | "markdown"; page: number | null; rects: HighlightRect[] };
type Bookmark = { id: string; readingId: string; page: number; createdAt: string };
type ReaderTheme = "light" | "paper" | "sepia" | "dark" | "midnight";

const statusLabels: Record<Status, string> = { wishlist: "Desejo ler", reading: "Lendo", read: "Já lido" };

function PdfIcon({ large = false }: { large?: boolean }) {
  return <span className={`premium-pdf-icon${large ? " large" : ""}`} aria-hidden="true"><FileText /><b>PDF</b></span>;
}

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
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
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

function parseHighlightRects(value: string | undefined): HighlightRect[] {
  try {
    const rects = JSON.parse(value ?? "[]") as unknown;
    return Array.isArray(rects) ? rects.filter((rect): rect is HighlightRect => Boolean(
      rect && typeof rect === "object" && [rect.x, rect.y, rect.width, rect.height].every((coordinate) => typeof coordinate === "number" && Number.isFinite(coordinate)),
    )) : [];
  } catch {
    return [];
  }
}

function MarkdownView({ markdown, highlights, fontSize, lineHeight, contentWidth }: { markdown: string; highlights: Highlight[]; fontSize: number; lineHeight: number; contentWidth: number }) {
  return <div className="markdown-view" style={{ fontSize: `${fontSize}px`, lineHeight, maxWidth: `${contentWidth}px` }}>{markdown.split("\n").map((line, index) => {
    if (line.startsWith("# ")) return <h1 key={index}>{highlightedLine(line.slice(2), highlights, `h1-${index}`)}</h1>;
    if (line.startsWith("## ")) return <h2 key={index}>{highlightedLine(line.slice(3), highlights, `h2-${index}`)}</h2>;
    if (line.startsWith("> ")) return <blockquote key={index}>{highlightedLine(line.slice(2), highlights, `bq-${index}`)}</blockquote>;
    return <p key={index}>{highlightedLine(line, highlights, `p-${index}`)}</p>;
  })}</div>;
}

function PdfCanvas({ reading, page, highlights, scale, fitWidth, onLoaded }: { reading: Reading; page: number; highlights: Highlight[]; scale: number; fitWidth: boolean; onLoaded: (count: number) => void }) {
  const pageWrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const onLoadedRef = useRef(onLoaded);
  const [error, setError] = useState("");
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => { onLoadedRef.current = onLoaded; }, [onLoaded]);

  useEffect(() => {
    const pageWrap = pageWrapRef.current;
    if (!pageWrap || !fitWidth) return;
    const updateWidth = () => setAvailableWidth(Math.floor(pageWrap.clientWidth));
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(pageWrap);
    return () => observer.disconnect();
  }, [fitWidth]);

  useEffect(() => {
    let cancelled = false;
    let task: { destroy(): Promise<void> } | undefined;
    (async () => {
      try {
        setError("");
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument({
          url: `/api/readings?file=${encodeURIComponent(reading.id)}`,
          rangeChunkSize: 256 * 1024,
          disableAutoFetch: false,
          disableRange: false,
          disableStream: false,
        });
        task = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        onLoadedRef.current(pdf.numPages);
        const pdfPage = await pdf.getPage(Math.min(page, pdf.numPages));
        const naturalViewport = pdfPage.getViewport({ scale: 1 });
        const fittedScale = fitWidth && availableWidth > 0 ? availableWidth / naturalViewport.width : scale;
        const viewport = pdfPage.getViewport({ scale: fittedScale });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        const deviceScale = Math.min(window.devicePixelRatio || 1, 2.5);
        const maximumCanvasPixels = 16_000_000;
        const requestedPixels = viewport.width * viewport.height * deviceScale * deviceScale;
        const outputScale = requestedPixels > maximumCanvasPixels
          ? deviceScale * Math.sqrt(maximumCanvasPixels / requestedPixels)
          : deviceScale;
        canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
        canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const context = canvas.getContext("2d");
        if (!context) return;
        await pdfPage.render({
          canvasContext: context,
          canvas,
          viewport,
          transform: outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
        }).promise;
        const textLayerContainer = textLayerRef.current;
        if (textLayerContainer && !cancelled) {
          textLayerContainer.replaceChildren();
          textLayerContainer.style.setProperty("--scale-factor", String(viewport.scale));
          const textLayer = new pdfjs.TextLayer({ textContentSource: await pdfPage.getTextContent(), container: textLayerContainer, viewport });
          await textLayer.render();
          const pageHighlights = highlights.filter((highlight) => highlight.source === "pdf" && highlight.page === page && parseHighlightRects(highlight.rects).length === 0);
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
  }, [reading.id, page, highlights, scale, fitWidth, availableWidth]);

  if (error) return <div className="reader-error">{error}</div>;
  const pageRects = highlights.filter((highlight) => highlight.source === "pdf" && highlight.page === page)
    .flatMap((highlight) => parseHighlightRects(highlight.rects).map((rect, index) => ({ ...rect, color: highlight.color, key: `${highlight.id}-${index}` })));
  return <div ref={pageWrapRef} className={`pdf-page-wrap${fitWidth ? " fit-width" : ""}`} data-highlight-source="pdf" data-highlight-page={page}>
    <canvas ref={canvasRef} className="pdf-canvas" aria-label={`Página ${page} de ${reading.title}`} />
    <div className="pdf-highlight-overlays" aria-hidden="true">{pageRects.map((rect) => <i key={rect.key} className={`pdf-highlight-rect highlight-${rect.color}`} style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.width * 100}%`, height: `${rect.height * 100}%` }} />)}</div>
    <div ref={textLayerRef} className="textLayer pdf-text-layer" />
  </div>;
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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("paper");
  const [zoom, setZoom] = useState(1.45);
  const [fitWidth, setFitWidth] = useState(true);
  const [spread, setSpread] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.75);
  const [contentWidth, setContentWidth] = useState(760);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Reading[]>([]);
  const documentStageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const currentPageBookmarked = Boolean(selected && bookmarks.some((bookmark) => bookmark.page === selected.currentPage));

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => {
    setLightMode(window.localStorage.getItem("outro-cerebro-reading-theme") === "light");
    setReaderTheme((window.localStorage.getItem("outro-cerebro-reader-theme") as ReaderTheme | null) ?? "paper");
    setFontSize(Number(window.localStorage.getItem("outro-cerebro-reader-font-size")) || 18);
    setLineHeight(Number(window.localStorage.getItem("outro-cerebro-reader-line-height")) || 1.75);
    setContentWidth(Number(window.localStorage.getItem("outro-cerebro-reader-width")) || 760);
    const sync = (event: Event) => setLightMode((event as CustomEvent<string>).detail === "light");
    window.addEventListener("outro-cerebro-theme", sync);
    return () => window.removeEventListener("outro-cerebro-theme", sync);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("outro-cerebro-reader-theme", readerTheme);
    window.localStorage.setItem("outro-cerebro-reader-font-size", String(fontSize));
    window.localStorage.setItem("outro-cerebro-reader-line-height", String(lineHeight));
    window.localStorage.setItem("outro-cerebro-reader-width", String(contentWidth));
  }, [readerTheme, fontSize, lineHeight, contentWidth]);

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

  useEffect(() => {
    if (!selectedId) { setBookmarks([]); return; }
    fetch(`/api/bookmarks?readingId=${encodeURIComponent(selectedId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { bookmarks: Bookmark[] }) => setBookmarks(data.bookmarks))
      .catch(() => setBookmarks([]));
  }, [selectedId]);

  useEffect(() => {
    if (!focusMode) { setChromeVisible(true); return; }
    let timeout = window.setTimeout(() => setChromeVisible(false), 2600);
    const reveal = () => { setChromeVisible(true); window.clearTimeout(timeout); timeout = window.setTimeout(() => setChromeVisible(false), 2600); };
    window.addEventListener("mousemove", reveal);
    window.addEventListener("keydown", reveal);
    return () => { window.clearTimeout(timeout); window.removeEventListener("mousemove", reveal); window.removeEventListener("keydown", reveal); };
  }, [focusMode]);

  const captureSelection = () => {
    const selection = window.getSelection();
    const stage = documentStageRef.current;
    if (!selection || selection.isCollapsed || !stage || !selection.anchorNode || !stage.contains(selection.anchorNode)) return;
    const quote = selection.toString().replace(/\s+/g, " ").trim();
    if (quote.length < 2) return;
    const range = selection.rangeCount ? selection.getRangeAt(0) : null;
    const commonNode = range?.commonAncestorContainer ?? selection.anchorNode;
    const element = commonNode.nodeType === Node.ELEMENT_NODE ? commonNode as Element : commonNode.parentElement;
    const pdfPage = element?.closest<HTMLElement>("[data-highlight-source='pdf']");
    const pageBounds = pdfPage?.getBoundingClientRect();
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const rects = pdfPage && pageBounds && range ? Array.from(range.getClientRects()).filter((rect) => rect.width > 1 && rect.height > 1).map((rect) => ({
      x: clamp((rect.left - pageBounds.left) / pageBounds.width),
      y: clamp((rect.top - pageBounds.top) / pageBounds.height),
      width: clamp(rect.width / pageBounds.width),
      height: clamp(rect.height / pageBounds.height),
    })) : [];
    setPendingHighlight({ quote: quote.slice(0, 3000), source: tab === "pdf" ? "pdf" : "markdown", page: pdfPage ? Number(pdfPage.dataset.highlightPage) : null, rects });
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

  const openReading = (id: string) => {
    setSelectedId(id);
    setTab("pdf");
    if (!window.matchMedia("(max-width: 960px)").matches) return;
    setSpread(false);
    setFitWidth(true);
    setFocusMode(true);
  };

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
      setItems((current) => [data.reading!, ...current]); openReading(data.reading.id); setMessage("");
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
    if (page === selected.currentPage) return;
    persist(selected.id, { currentPage: page, status: selected.status === "wishlist" ? "reading" : selected.status });
    window.requestAnimationFrame(() => documentStageRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const onReaderTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (tab !== "pdf" || event.touches.length !== 1) { touchStartRef.current = null; return; }
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  };

  const onReaderTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start || tab !== "pdf" || event.changedTouches.length !== 1) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) { captureSelection(); return; }
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, .highlight-composer")) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    const horizontalSwipe = Math.abs(deltaX) >= 52 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;
    if (horizontalSwipe) {
      changePage(selected.currentPage + (deltaX < 0 ? 1 : -1));
      return;
    }
    const isTap = Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12 && Date.now() - start.time < 500;
    if (!isTap) return;
    const bounds = documentStageRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const position = (touch.clientX - bounds.left) / bounds.width;
    if (position <= .34) changePage(selected.currentPage - 1);
    else if (position >= .66) changePage(selected.currentPage + 1);
    else if (focusMode) setChromeVisible((value) => !value);
  };

  const toggleBookmark = useCallback(async () => {
    if (!selected) return;
    const exists = bookmarks.some((bookmark) => bookmark.page === selected.currentPage);
    if (exists) {
      const response = await fetch(`/api/bookmarks?readingId=${encodeURIComponent(selected.id)}&page=${selected.currentPage}`, { method: "DELETE" });
      if (response.ok) setBookmarks((current) => current.filter((bookmark) => bookmark.page !== selected.currentPage));
      return;
    }
    const response = await fetch("/api/bookmarks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ readingId: selected.id, page: selected.currentPage }) });
    const data = await response.json() as { bookmark?: Bookmark };
    if (response.ok && data.bookmark) setBookmarks((current) => [...current, data.bookmark!].sort((a, b) => a.page - b.page));
  }, [selected, bookmarks]);

  const searchResults = useMemo(() => {
    if (!selected || searchQuery.trim().length < 2) return [];
    const query = searchQuery.trim().toLocaleLowerCase("pt-BR");
    return selected.markdown.split(/(?=## Página \d+)/i).flatMap((section) => {
      const page = Number(section.match(/^## Página (\d+)/i)?.[1]);
      const normalized = section.toLocaleLowerCase("pt-BR");
      const position = normalized.indexOf(query);
      if (!page || position < 0) return [];
      return [{ page, excerpt: section.slice(Math.max(0, position - 55), position + query.length + 95).replace(/[#\n]+/g, " ").trim() }];
    }).slice(0, 30);
  }, [selected, searchQuery]);

  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select") && event.key !== "Escape") return;
      if (event.key === "ArrowLeft") changePage((selected?.currentPage ?? 1) - 1);
      if (event.key === "ArrowRight") changePage((selected?.currentPage ?? 1) + 1);
      if (event.key.toLowerCase() === "f") setFocusMode((value) => !value);
      if (event.key.toLowerCase() === "b") toggleBookmark();
      if (event.key === "/") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "+" || event.key === "=") setZoom((value) => Math.min(2.4, value + .15));
      if (event.key === "-") setZoom((value) => Math.max(.7, value - .15));
      if (event.key === "Escape") { setSearchOpen(false); setSettingsOpen(false); setFocusMode(false); }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, [selected, toggleBookmark]);

  return (
    <main className={`reading-shell reader-theme-${readerTheme}${lightMode ? " light-reading" : ""}${focusMode ? " immersive-reader" : ""}${focusMode && !chromeVisible ? " chrome-hidden" : ""}`}>
      <header className="reading-topbar">
        <a href="/workspace" className="reading-brand"><img src="/outro-cerebro-symbol.webp" alt="" aria-hidden="true" /><b>Outro Cérebro</b></a>
        <div><span className="saved-indicator">● Progresso salvo</span><ThemeToggle /><a href="/workspace">Voltar às notas</a></div>
      </header>
      <aside className="library-panel">
        <div className="library-title"><div><small>BIBLIOTECA PESSOAL</small><h1>Minhas leituras</h1></div><span>{items.length}</span></div>
        <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={(event) => onUpload(event.target.files?.[0])} />
        <button className="upload-pdf" disabled={uploading} onClick={() => inputRef.current?.click()}>{uploading ? <><Timer className="spin-icon" /> Processando…</> : <><Upload /> Adicionar PDF</>}</button>
        <div className="reading-filters">
          {(["all", "reading", "wishlist", "read"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "Todos" : statusLabels[value]}</button>)}
        </div>
        <div className="library-list">
          {filtered.map((item) => {
            const progress = Math.round((item.currentPage / item.totalPages) * 100);
            return <button key={item.id} className={item.id === selectedId ? "library-item active" : "library-item"} onClick={() => openReading(item.id)}>
              <PdfIcon /><span className="library-copy"><b>{item.title}</b><small>{statusLabels[item.status]} · pág. {item.currentPage}/{item.totalPages}</small><em><u style={{ width: `${progress}%` }} /></em></span>
            </button>;
          })}
          {message && <p className="library-message">{message}</p>}
        </div>
        <div className="library-private"><LockKeyhole /><p>Biblioteca privada<small>Arquivos e progresso visíveis apenas para você.</small></p></div>
      </aside>

      {!selected ? <section className="reading-empty">
        <PdfIcon large /><h2>Sua sala de leitura</h2><p>Adicione um PDF para transformar a leitura em memória: texto em Markdown, links, conexões, tempo e progresso.</p><button onClick={() => inputRef.current?.click()}><Upload /> Escolher primeiro PDF</button>
        <div className="feature-row"><span><History /><b>Retome da página</b></span><span><Timer /><b>Registre seu tempo</b></span><span><Network /><b>Conecte ideias</b></span></div>
      </section> : <>
        <section className="reader-stage">
          <div className="reader-heading">
            <button className="reader-back" onClick={() => setSelectedId(null)} aria-label="Voltar à biblioteca"><ArrowLeft /></button>
            <div className="reader-title"><small>{statusLabels[selected.status]}</small><h1>{selected.title}</h1></div>
            <div className="reader-tools">
              <button className={currentPageBookmarked ? "active" : ""} onClick={toggleBookmark} title="Marcar página (B)"><Bookmark fill={currentPageBookmarked ? "currentColor" : "none"} /></button>
              <button className={searchOpen ? "active" : ""} onClick={() => setSearchOpen((value) => !value)} title="Buscar no livro (/)" ><Search /></button>
              <button className={settingsOpen ? "active" : ""} onClick={() => setSettingsOpen((value) => !value)} title="Aparência"><Settings2 /></button>
              <button className={focusMode ? "active" : ""} onClick={() => setFocusMode((value) => !value)} title="Modo foco (F)">{focusMode ? <Minimize2 /> : <Maximize2 />}</button>
              <select value={selected.status} onChange={(event) => persist(selected.id, { status: event.target.value as Status })} aria-label="Estado da leitura">
                <option value="wishlist">Desejo ler</option><option value="reading">Lendo</option><option value="read">Já lido</option>
              </select>
            </div>
          </div>
          <div className="reader-tabs">
            <button className={tab === "pdf" ? "active" : ""} onClick={() => setTab("pdf")}><FileText /> Documento</button><button className={tab === "markdown" ? "active" : ""} onClick={() => setTab("markdown")}><BookOpenText /> Leitura</button><button className={tab === "graph" ? "active" : ""} onClick={() => setTab("graph")}><GitBranch /> Conexões</button>
            {tab === "pdf" && <div className="document-tools"><button aria-label="Diminuir zoom" onClick={() => { setFitWidth(false); setZoom((value) => Math.max(.7, value - .15)); }}><ZoomOut /></button><span>{fitWidth ? "Ajustado" : `${Math.round((zoom / 1.45) * 100)}%`}</span><button aria-label="Aumentar zoom" onClick={() => { setFitWidth(false); setZoom((value) => Math.min(2.4, value + .15)); }}><ZoomIn /></button><button className={fitWidth ? "active" : ""} onClick={() => { setSpread(false); setFitWidth(true); }}><Focus /> Largura</button><button className={spread ? "active" : ""} onClick={() => { setFitWidth(false); setSpread((value) => !value); }}><Columns2 /> 2 páginas</button></div>}
          </div>
          {searchOpen && <aside className="reader-popover search-popover"><div><b>Buscar no livro</b><button onClick={() => setSearchOpen(false)}>×</button></div><input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Palavra ou frase…" />
            <small>{searchQuery.trim().length < 2 ? "Digite ao menos 2 caracteres" : `${searchResults.length} resultado(s)`}</small>
            <div>{searchResults.map((result) => <button key={result.page} onClick={() => { changePage(result.page); setSearchOpen(false); }}><b>Página {result.page}</b><span>{result.excerpt}</span></button>)}</div>
          </aside>}
          {settingsOpen && <aside className="reader-popover settings-popover"><div><b>Aparência da leitura</b><button onClick={() => setSettingsOpen(false)}>×</button></div><label>Tema<select value={readerTheme} onChange={(event) => setReaderTheme(event.target.value as ReaderTheme)}><option value="light">Claro</option><option value="paper">Papel</option><option value="sepia">Sépia</option><option value="dark">Escuro</option><option value="midnight">Meia-noite</option></select></label><label>Tamanho do texto<input type="range" min="14" max="28" value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} /></label><label>Entrelinhas<input type="range" min="1.35" max="2.2" step=".05" value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} /></label><label>Largura da coluna<input type="range" min="540" max="1000" step="20" value={contentWidth} onChange={(event) => setContentWidth(Number(event.target.value))} /></label></aside>}
          <div ref={documentStageRef} className="document-stage" role="application" tabIndex={0} aria-label="Leitor de PDF: use as setas, toque nas laterais ou deslize para mudar de página" onMouseUp={(event) => { if (!(event.target as HTMLElement).closest(".highlight-composer")) captureSelection(); }} onTouchStart={onReaderTouchStart} onTouchEnd={onReaderTouchEnd}>
            {tab === "pdf" && <><div className="mobile-page-hint" aria-hidden="true">Toque nas laterais ou deslize para mudar de página</div><div className={spread ? "pdf-spread" : "pdf-single"}><PdfCanvas reading={selected} page={selected.currentPage} scale={zoom} fitWidth={fitWidth} highlights={highlights} onLoaded={(count) => count !== selected.totalPages && setItems((current) => current.map((item) => item.id === selected.id ? { ...item, totalPages: count } : item))} />{spread && selected.currentPage < selected.totalPages && <PdfCanvas reading={selected} page={selected.currentPage + 1} scale={zoom} fitWidth={false} highlights={highlights} onLoaded={() => undefined} />}</div></>}
            {tab === "markdown" && <div data-highlight-source="markdown"><MarkdownView markdown={selected.markdown} highlights={highlights.filter((highlight) => highlight.source === "markdown")} fontSize={fontSize} lineHeight={lineHeight} contentWidth={contentWidth} /></div>}
            {tab === "graph" && <div className="reading-graph"><div className="graph-center">{selected.title.slice(0, 32)}</div>{(domains.length ? domains : ["Sem links externos"]).map((domain, index) => <div key={domain} className={`domain-node domain-${index + 1}`}>{domain}</div>)}</div>}
            {pendingHighlight && <div className="highlight-composer" role="dialog" aria-label="Criar destaque">
              <div className="selected-quote">“{pendingHighlight.quote.slice(0, 180)}{pendingHighlight.quote.length > 180 ? "…" : ""}”</div>
              <div className="highlight-palette">
                {(["yellow", "green", "blue", "pink", "violet"] as HighlightColor[]).map((color) => <button key={color} className={`color-dot highlight-${color} ${highlightColor === color ? "active" : ""}`} onClick={() => setHighlightColor(color)} aria-label={`Destaque ${color}`} />)}
              </div>
              <textarea value={highlightNote} onChange={(event) => setHighlightNote(event.target.value)} placeholder="Adicionar uma nota a este trecho (opcional)…" aria-label="Nota do destaque" />
              <div className="highlight-actions"><button onClick={() => setPendingHighlight(null)}>Cancelar</button><button className="save" disabled={savingHighlight} onClick={saveHighlight}>{savingHighlight ? "Salvando…" : "Destacar"}</button></div>
            </div>}
          </div>
          <div className="page-controls"><button aria-label="Página anterior" disabled={selected.currentPage <= 1} onClick={() => changePage(selected.currentPage - (spread ? 2 : 1))}><ChevronLeft /> <span>Anterior</span></button><input aria-label="Progresso da leitura" type="range" min="1" max={selected.totalPages} value={selected.currentPage} onChange={(event) => changePage(Number(event.target.value))} /><span>Página <b>{selected.currentPage}</b> de {selected.totalPages}</span><button aria-label="Próxima página" disabled={selected.currentPage >= selected.totalPages} onClick={() => changePage(selected.currentPage + (spread ? 2 : 1))}><span>Próxima</span> <ChevronRight /></button></div>
        </section>
        <aside className="reading-session">
          <small>SESSÃO DE LEITURA</small><div className={running ? "timer running" : "timer"}>{formatTime(selected.totalSeconds)}</div><p>Tempo total registrado</p>
          <button className={running ? "timer-button pause" : "timer-button"} onClick={() => { if (running) persist(selected.id, { totalSeconds: selected.totalSeconds }); else if (selected.status === "wishlist") persist(selected.id, { status: "reading" }); setRunning((value) => !value); }}>{running ? <><Pause /> Pausar cronômetro</> : <><Play /> Iniciar cronômetro</>}</button>
          <div className="session-stats"><span><b>{Math.round((selected.currentPage / selected.totalPages) * 100)}%</b>progresso</span><span><b>{selected.totalPages - selected.currentPage}</b>páginas restantes</span></div>
          <div className="resume-card"><History /><p><b>Retomada automática</b>Ao reabrir, você continuará na página {selected.currentPage}.</p></div>
          <div className="bookmark-list"><div><small>MARCADORES</small><b>{bookmarks.length}</b></div>{bookmarks.length ? bookmarks.map((bookmark) => <button key={bookmark.id} onClick={() => changePage(bookmark.page)}>Página {bookmark.page}<ExternalLink /></button>) : <p>Nenhuma página marcada.</p>}</div>
          <button className="mark-read" onClick={() => persist(selected.id, { status: selected.status === "read" ? "reading" : "read" })}>{selected.status === "read" ? <><History /> Voltar para Lendo</> : <><Check /> Marcar como já lido</>}</button>
          <div className="markdown-summary"><small>REGISTRO CRIADO</small><p><FileCode2 /> {selected.title}</p><p><FileText /> {selected.totalPages} páginas em Markdown</p><p><Network /> {domains.length} links conectados</p></div>
          <div className="annotations-panel"><div className="annotations-heading"><small>DESTAQUES E NOTAS</small><b>{highlights.length}</b></div>
            <p className="annotations-help">Selecione um trecho no PDF ou Markdown para destacar.</p>
            <div className="annotations-list">{highlights.map((highlight) => <article key={highlight.id} className={`annotation-card annotation-${highlight.color}`}>
              <div><i className={`color-dot highlight-${highlight.color}`} /><small>{highlight.source === "pdf" ? `PDF · página ${highlight.page}` : "Markdown"}</small><button onClick={() => deleteHighlight(highlight.id)} aria-label="Excluir destaque"><Trash2 /></button></div>
              <blockquote>“{highlight.quote}”</blockquote>{highlight.note && <p>{highlight.note}</p>}
            </article>)}</div>
          </div>
        </aside>
      </>}
    </main>
  );
}
