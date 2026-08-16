"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenText, Brain, CalendarDays, CalendarPlus, Check, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, Circle, Clock3, Eye, FileText, Focus, Heading2,
  Lightbulb, Link2, ListChecks, LockKeyhole, Network, PencilLine, Plus, Quote,
  Search, Star, Tags, TerminalSquare, Trash2, X,
} from "lucide-react";
import ThemeToggle from "../ThemeToggle";

type WorkspaceArea = "memoria" | "raciocinio" | "conexoes" | "agenda";
type PageArea = Exclude<WorkspaceArea, "agenda">;
type SaveState = "saved" | "saving" | "error";
type AgendaColor = "violet" | "cyan" | "green" | "amber" | "coral";

type WorkspacePage = {
  id: string;
  area: PageArea;
  title: string;
  content: string;
  icon: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

type AgendaItem = {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  kind: "task" | "event";
  color: AgendaColor;
  done: boolean;
};

const areaDetails = {
  memoria: { label: "Memória", description: "Capture notas, referências e tudo que não pode se perder.", Icon: Brain, empty: "Comece registrando algo que deseja lembrar." },
  raciocinio: { label: "Raciocínio", description: "Desenvolva argumentos, decisões e linhas de pensamento.", Icon: Lightbulb, empty: "Abra uma página para estruturar um raciocínio." },
  conexoes: { label: "Conexões", description: "Relacione temas, pessoas e ideias para descobrir padrões.", Icon: Network, empty: "Crie uma página para mapear novas relações." },
  agenda: { label: "Agenda", description: "Tarefas e compromissos em uma visão clara do mês.", Icon: CalendarDays, empty: "Sua agenda está livre." },
} as const;

const navItems = [
  { key: "memoria", Icon: Brain, title: "MEMÓRIA", subtitle: "Guarde o que importa.", href: "/workspace" },
  { key: "raciocinio", Icon: Lightbulb, title: "RACIOCÍNIO", subtitle: "Organize suas ideias.", href: "/workspace?area=raciocinio" },
  { key: "conexoes", Icon: Network, title: "CONEXÕES", subtitle: "Descubra relações.", href: "/workspace?area=conexoes" },
  { key: "agenda", Icon: CalendarDays, title: "AGENDA", subtitle: "Planeje seus dias.", href: "/workspace?area=agenda" },
  { key: "leituras", Icon: BookOpenText, title: "LEITURAS", subtitle: "Leia e registre.", href: "/workspace/leituras" },
] as const;

const pageStarters: Record<PageArea, { title: string; icon: string; content: string }> = {
  memoria: { title: "Nova página", icon: "📝", content: "# Nova página\n\nComece a escrever. Digite / em uma linha vazia para inserir um bloco." },
  raciocinio: { title: "Novo raciocínio", icon: "💡", content: "# Questão\n\n## Contexto\n\n## Hipóteses\n\n- [ ] Próxima ação" },
  conexoes: { title: "Nova conexão", icon: "🔗", content: "# Ponto de partida\n\nConecte esta página a outras ideias usando [[colchetes duplos]]." },
};

const weekdayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function calendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

function calendarRange(month: Date) {
  const days = calendarDays(month);
  return { from: dateKey(days[0]), to: dateKey(days[days.length - 1]) };
}

function Mark({ compact = false }: { compact?: boolean }) {
  return <img className={compact ? "brand-symbol compact" : "brand-symbol"} src="/outro-cerebro-symbol.webp" alt="" aria-hidden="true" />;
}

function PagePreview({ content }: { content: string }) {
  const lines = content.split("\n");
  return <div className="notion-preview">{lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 12)}`;
    if (line.startsWith("### ")) return <h4 key={key}>{line.slice(4)}</h4>;
    if (line.startsWith("## ")) return <h3 key={key}>{line.slice(3)}</h3>;
    if (line.startsWith("# ")) return <h2 key={key}>{line.slice(2)}</h2>;
    if (/^- \[[ xX]\] /.test(line)) return <p className="preview-check" key={key}><CheckCircle2 />{line.slice(6)}</p>;
    if (line.startsWith("> ")) return <blockquote key={key}>{line.slice(2)}</blockquote>;
    if (line.startsWith("- ")) return <p className="preview-list" key={key}>• {line.slice(2)}</p>;
    return line ? <p key={key}>{line}</p> : <span className="preview-space" key={key} />;
  })}</div>;
}

function AgendaView({
  month, setMonth, selectedDate, setSelectedDate, items, onCreate, onToggle, onDelete,
}: {
  month: Date;
  setMonth: (date: Date) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  items: AgendaItem[];
  onCreate: (item: Omit<AgendaItem, "id" | "done">) => Promise<void>;
  onToggle: (item: AgendaItem) => void;
  onDelete: (item: AgendaItem) => void;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<"task" | "event">("event");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState<AgendaColor>("violet");
  const titleRef = useRef<HTMLInputElement>(null);
  const days = useMemo(() => calendarDays(month), [month]);
  const today = dateKey(new Date());
  const selectedItems = items.filter((item) => item.date === selectedDate);

  useEffect(() => {
    if (composerOpen) window.requestAnimationFrame(() => titleRef.current?.focus());
  }, [composerOpen]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await onCreate({ title: title.trim(), notes: "", date: selectedDate, startTime: kind === "event" ? startTime : null, endTime: kind === "event" ? endTime : null, kind, color });
    setTitle("");
    setComposerOpen(false);
  }

  return <section className="calendar-shell">
    <header className="calendar-toolbar">
      <div><small>PLANEJAMENTO</small><h1>{monthNames[month.getMonth()]} <span>{month.getFullYear()}</span></h1></div>
      <div className="calendar-actions">
        <button onClick={() => { const todayDate = new Date(); setMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)); setSelectedDate(dateKey(todayDate)); }}>Hoje</button>
        <span><button aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft /></button><button aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight /></button></span>
        <button className="calendar-create" onClick={() => setComposerOpen(true)}><CalendarPlus /> Criar</button>
      </div>
    </header>
    <div className="calendar-layout">
      <div className="month-calendar">
        <div className="weekday-row">{weekdayNames.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="month-grid">{days.map((day) => {
          const key = dateKey(day);
          const dayItems = items.filter((item) => item.date === key);
          return <button key={key} className={`${day.getMonth() !== month.getMonth() ? "outside " : ""}${key === selectedDate ? "selected " : ""}${key === today ? "today" : ""}`} onClick={() => setSelectedDate(key)}>
            <time>{day.getDate()}</time>
            <span className="day-items">{dayItems.slice(0, 3).map((item) => <i key={item.id} className={`event-pill ${item.color} ${item.done ? "done" : ""}`}>{item.startTime ?? "✓"} {item.title}</i>)}{dayItems.length > 3 ? <small>+{dayItems.length - 3}</small> : null}</span>
          </button>;
        })}</div>
      </div>
      <aside className="day-agenda">
        <header><div><small>AGENDA DO DIA</small><h2>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(new Date(`${selectedDate}T12:00:00`))}</h2></div><button aria-label="Adicionar neste dia" onClick={() => setComposerOpen(true)}><Plus /></button></header>
        <div className="day-agenda-list">{selectedItems.length ? selectedItems.map((item) => <article key={item.id} className={`agenda-card ${item.color} ${item.done ? "done" : ""}`}>
          <button className="agenda-check" aria-label={item.done ? "Marcar como pendente" : "Concluir"} onClick={() => onToggle(item)}>{item.done ? <CheckCircle2 /> : <Circle />}</button>
          <div><small>{item.kind === "event" ? "COMPROMISSO" : "TAREFA"}</small><b>{item.title}</b><span>{item.startTime ? <><Clock3 /> {item.startTime}{item.endTime ? ` — ${item.endTime}` : ""}</> : "Durante o dia"}</span></div>
          <button className="agenda-delete" aria-label="Excluir item" onClick={() => onDelete(item)}><Trash2 /></button>
        </article>) : <div className="agenda-empty"><CalendarDays /><b>Dia livre</b><span>Toque em + para planejar.</span></div>}</div>
      </aside>
    </div>
    {composerOpen ? <div className="composer-backdrop" role="button" tabIndex={-1} aria-label="Fechar formulário" onKeyDown={(event) => event.key === "Escape" && setComposerOpen(false)} onMouseDown={(event) => event.target === event.currentTarget && setComposerOpen(false)}><form className="agenda-composer" onSubmit={submit}>
      <header><div><CalendarPlus /><span><small>NOVO ITEM</small><b>{selectedDate.split("-").reverse().join("/")}</b></span></div><button type="button" aria-label="Fechar" onClick={() => setComposerOpen(false)}><X /></button></header>
      <input ref={titleRef} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Adicionar título" maxLength={180} />
      <div className="kind-switch"><button type="button" className={kind === "event" ? "active" : ""} onClick={() => setKind("event")}>Compromisso</button><button type="button" className={kind === "task" ? "active" : ""} onClick={() => setKind("task")}>Tarefa</button></div>
      {kind === "event" ? <div className="time-fields"><label>Início<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label>Fim<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} /></label></div> : null}
      <fieldset><legend>Cor</legend>{(["violet", "cyan", "green", "amber", "coral"] as AgendaColor[]).map((value) => <button type="button" aria-label={`Cor ${value}`} aria-pressed={color === value} className={value} key={value} onClick={() => setColor(value)} />)}</fieldset>
      <footer><button type="button" onClick={() => setComposerOpen(false)}>Cancelar</button><button className="primary" type="submit">Salvar na agenda</button></footer>
    </form></div> : null}
  </section>;
}

export default function WorkspaceClient({ displayName, email, initialArea }: { displayName: string; email: string; initialArea: WorkspaceArea }) {
  const [pages, setPages] = useState<WorkspacePage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", content: "", icon: "📝", favorite: false });
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"edit" | "read">("edit");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [zen, setZen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const isAgenda = initialArea === "agenda";
  const activeArea = areaDetails[initialArea];
  const ActiveAreaIcon = activeArea.Icon;

  useEffect(() => {
    let cancelled = false;
    const range = calendarRange(month);
    fetch(`/api/workspace?area=${isAgenda ? "memoria" : initialArea}&from=${range.from}&to=${range.to}`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() as Promise<{ pages: WorkspacePage[]; agenda: AgendaItem[] }> : null)
      .then((data) => {
      if (!data || cancelled) return;
      setAgenda(data.agenda);
      if (!isAgenda) {
        setPages(data.pages);
        const firstPage = data.pages[0] ?? null;
        setSelectedId(firstPage?.id ?? null);
        if (firstPage) setDraft({ title: firstPage.title, content: firstPage.content, icon: firstPage.icon, favorite: firstPage.favorite });
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [initialArea, isAgenda, month]);

  const selectedPage = pages.find((page) => page.id === selectedId) ?? null;

  useEffect(() => {
    if (!dirty || !selectedId) return;
    const timer = window.setTimeout(async () => {
      const response = await fetch("/api/workspace", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "page", id: selectedId, ...draft }) });
      if (response.ok) {
        const data = await response.json() as { page: WorkspacePage };
        setPages((current) => current.map((page) => page.id === data.page.id ? data.page : page));
        setDirty(false);
        setSaveState("saved");
      } else setSaveState("error");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, selectedId]);

  const addPage = useCallback(async () => {
    if (isAgenda) return;
    const starter = pageStarters[initialArea];
    const response = await fetch("/api/workspace", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "page", area: initialArea, ...starter }) });
    if (!response.ok) return;
    const data = await response.json() as { page: WorkspacePage };
    setPages((current) => [data.page, ...current]);
    setSelectedId(data.page.id);
    setDraft({ title: data.page.title, content: data.page.content, icon: data.page.icon, favorite: data.page.favorite });
    setDirty(false);
    setSaveState("saved");
    setCommandOpen(false);
    window.setTimeout(() => editorRef.current?.focus(), 50);
  }, [initialArea, isAgenda]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n" && !isAgenda) { event.preventDefault(); void addPage(); }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "p") { event.preventDefault(); setCommandOpen((value) => !value); }
      if (event.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addPage, isAgenda]);

  async function deletePage() {
    if (!selectedPage || !window.confirm(`Excluir “${selectedPage.title}”?`)) return;
    const response = await fetch(`/api/workspace?type=page&id=${selectedPage.id}`, { method: "DELETE" });
    if (response.ok) {
      const remaining = pages.filter((page) => page.id !== selectedPage.id);
      setPages(remaining);
      setSelectedId(remaining[0]?.id ?? null);
      if (remaining[0]) setDraft({ title: remaining[0].title, content: remaining[0].content, icon: remaining[0].icon, favorite: remaining[0].favorite });
    }
  }

  function updateDraft(changes: Partial<typeof draft>) {
    setDraft((current) => ({ ...current, ...changes }));
    setDirty(true);
    setSaveState("saving");
  }

  function selectPage(page: WorkspacePage) {
    setSelectedId(page.id);
    setDraft({ title: page.title, content: page.content, icon: page.icon, favorite: page.favorite });
    setDirty(false);
    setSaveState("saved");
  }

  function insertBlock(value: string) {
    const content = draft.content.endsWith("\n/") ? draft.content.slice(0, -1) + value : `${draft.content}\n${value}`;
    updateDraft({ content });
    editorRef.current?.focus();
  }

  async function createAgendaItem(item: Omit<AgendaItem, "id" | "done">) {
    const response = await fetch("/api/workspace", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "agenda", ...item }) });
    if (response.ok) {
      const data = await response.json() as { item: AgendaItem };
      setAgenda((current) => [...current, data.item]);
    }
  }

  async function toggleAgendaItem(item: AgendaItem) {
    setAgenda((current) => current.map((entry) => entry.id === item.id ? { ...entry, done: !entry.done } : entry));
    await fetch("/api/workspace", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "agenda", id: item.id, done: !item.done }) });
  }

  async function deleteAgendaItem(item: AgendaItem) {
    if (!window.confirm(`Excluir “${item.title}”?`)) return;
    const response = await fetch(`/api/workspace?type=agenda&id=${item.id}`, { method: "DELETE" });
    if (response.ok) setAgenda((current) => current.filter((entry) => entry.id !== item.id));
  }

  const filteredPages = pages.filter((page) => page.title.toLowerCase().includes(query.toLowerCase()) || page.content.toLowerCase().includes(query.toLowerCase()));
  const showSlashMenu = mode === "edit" && /(^|\n)\/$/.test(draft.content);

  return <main className={`${zen ? "workspace zen" : "workspace"}${isAgenda ? " agenda-workspace" : ""}`}>
    <header className="topbar">
      <div className="product-name"><Mark compact /><strong>Outro Cérebro</strong><span className="top-area">/ {activeArea.label}</span></div>
      <div className="top-actions">
        {!isAgenda ? <button aria-label="Buscar" onClick={() => searchRef.current?.focus()}><Search /></button> : null}
        <button aria-label="Abrir ações rápidas" title="Ações rápidas" onClick={() => setCommandOpen(true)}><TerminalSquare /></button>
        <ThemeToggle variant="icon" />
        {!isAgenda ? <button aria-label="Alternar foco" onClick={() => setZen((value) => !value)}><Focus /></button> : null}
        <form action="/api/auth/logout" method="post"><button className="avatar" aria-label={`Sair da conta de ${displayName}`} title={`${displayName} · ${email} · Sair`} type="submit">{displayName.charAt(0).toUpperCase()}</button></form>
      </div>
    </header>

    <aside className="identity-panel">
      <div className="brand-lockup"><span className="brand-logo" aria-label="Outro Cérebro"><img className="brand-image brand-image-dark" src="/outro-cerebro-logo-dark.webp" alt="Outro Cérebro" /><img className="brand-image brand-image-light" src="/outro-cerebro-logo-light.webp" alt="" aria-hidden="true" /></span><span className="identity-symbol"><Mark /></span><p>Seu espaço privado<br />para pensar.</p></div>
      <nav aria-label="Áreas do conhecimento">{navItems.map(({ key, Icon, title, subtitle, href }) => <a key={key} href={href} aria-current={key === initialArea ? "page" : undefined} className={key === initialArea ? "nav-item active" : "nav-item"}><span className="nav-icon"><Icon /></span><span><b>{title}</b><small>{subtitle}</small></span></a>)}</nav>
      <div className="privacy"><LockKeyhole /><p>Uso estritamente pessoal<small>Seus dados. Suas ideias.</small></p></div>
    </aside>

    {isAgenda ? <AgendaView month={month} setMonth={setMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} items={agenda} onCreate={createAgendaItem} onToggle={toggleAgendaItem} onDelete={deleteAgendaItem} /> : <>
      <aside className="notes-panel">
        <div className="notes-area-label"><ActiveAreaIcon /><span><small>ESPAÇO</small><b>{activeArea.label}</b></span></div>
        <label className="search-box"><Search /><input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar páginas..." aria-label="Buscar páginas" /><kbd>⌘K</kbd></label>
        <button className="new-note" onClick={() => void addPage()}><Plus /> Nova página <ChevronDown /></button>
        <div className="note-groups">
          {filteredPages.some((page) => page.favorite) ? <section className="note-group"><h2>FAVORITAS</h2>{filteredPages.filter((page) => page.favorite).map((page) => <button key={page.id} className={selectedId === page.id ? "note-row selected" : "note-row"} onClick={() => selectPage(page)}><span><i>{page.icon}</i>{page.title}</span><Star /></button>)}</section> : null}
          <section className="note-group"><h2>PÁGINAS</h2>{filteredPages.filter((page) => !page.favorite).map((page) => <button key={page.id} className={selectedId === page.id ? "note-row selected" : "note-row"} onClick={() => selectPage(page)}><span><i>{page.icon}</i>{page.title}</span><time>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(page.updatedAt))}</time></button>)}</section>
          {!loading && !filteredPages.length ? <div className="empty-pages"><FileText /><b>{query ? "Nada encontrado" : "Nenhuma página ainda"}</b><span>{query ? "Tente outro termo." : activeArea.empty}</span>{!query ? <button onClick={() => void addPage()}><Plus /> Criar primeira página</button> : null}</div> : null}
        </div>
      </aside>

      <section className="editor-panel notion-editor">
        {selectedPage ? <>
          <div className="editor-titlebar"><span className={`save-state ${saveState}`}>{saveState === "saving" ? "Salvando…" : saveState === "error" ? "Não foi possível salvar" : <><Check /> Salvo automaticamente</>}</span><div><button aria-label={draft.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} className={draft.favorite ? "active" : ""} onClick={() => updateDraft({ favorite: !draft.favorite })}><Star /></button><button aria-label="Excluir página" onClick={() => void deletePage()}><Trash2 /></button></div></div>
          <div className="mode-switch" role="tablist" aria-label="Modo da página"><button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}><PencilLine /> Editar</button><button className={mode === "read" ? "active" : ""} onClick={() => setMode("read")}><Eye /> Visualizar</button></div>
          <article className="page-canvas">
            <input className="page-icon-input" aria-label="Ícone da página" value={draft.icon} maxLength={8} onChange={(event) => updateDraft({ icon: event.target.value })} />
            <input className="page-title-input" aria-label="Título da página" value={draft.title} maxLength={200} onChange={(event) => updateDraft({ title: event.target.value })} placeholder="Sem título" />
            {mode === "edit" ? <div className="block-editor"><textarea ref={editorRef} aria-label="Conteúdo da página" value={draft.content} onChange={(event) => updateDraft({ content: event.target.value })} placeholder="Escreva algo ou digite / para inserir um bloco…" spellCheck />{showSlashMenu ? <div className="slash-menu"><small>BLOCOS BÁSICOS</small><button onClick={() => insertBlock("## Título")}><Heading2 /><span><b>Título</b><small>Seção de destaque</small></span></button><button onClick={() => insertBlock("- [ ] Tarefa")}><ListChecks /><span><b>Lista de tarefas</b><small>Itens que podem ser concluídos</small></span></button><button onClick={() => insertBlock("> Citação")}><Quote /><span><b>Citação</b><small>Realce uma ideia importante</small></span></button></div> : null}</div> : <PagePreview content={draft.content} />}
          </article>
          <footer className="editor-footer"><span className="footer-icons"><Tags /><Link2 /></span><span>{draft.content.trim() ? draft.content.trim().split(/\s+/).length : 0} palavras · Markdown</span></footer>
        </> : <div className="editor-empty"><ActiveAreaIcon /><h1>{activeArea.label}</h1><p>{activeArea.empty}</p><button onClick={() => void addPage()}><Plus /> Criar página</button></div>}
      </section>

      <aside className="context-panel workspace-context">
        <section className="context-section"><div className="section-heading"><h2>PRÓXIMOS</h2><a href="/workspace?area=agenda">Ver agenda <ChevronRight /></a></div>{agenda.slice(0, 5).map((item) => <button key={item.id} className={item.done ? "task done" : "task"} onClick={() => void toggleAgendaItem(item)}><i>{item.done ? <Check /> : null}</i><span>{item.title}</span><time>{item.date.slice(8, 10)}/{item.date.slice(5, 7)}</time></button>)}{!agenda.length ? <p className="context-empty">Nenhum compromisso neste período.</p> : null}</section>
        <section className="context-section notion-tips"><div className="section-heading"><h2>ATALHOS</h2></div><p><kbd>⌘N</kbd><span>Nova página</span></p><p><kbd>⌘K</kbd><span>Buscar</span></p><p><kbd>/</kbd><span>Inserir bloco</span></p></section>
        <section className="context-section"><div className="section-heading"><h2>SOBRE ESTA ÁREA</h2></div><div className="area-card"><ActiveAreaIcon /><b>{activeArea.label}</b><p>{activeArea.description}</p></div></section>
      </aside>
    </>}

    {commandOpen ? <div className="command-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCommandOpen(false)}><section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title"><header><span><TerminalSquare /><b id="command-title">Ações rápidas</b></span><button aria-label="Fechar ações" onClick={() => setCommandOpen(false)}><X /></button></header><div>
      {!isAgenda ? <button onClick={() => void addPage()}><Plus /><span><b>Nova página</b><small>Comece uma nova ideia</small></span><kbd>⌘N</kbd></button> : null}
      <a href="/workspace?area=agenda"><CalendarDays /><span><b>Abrir agenda</b><small>Tarefas e compromissos</small></span><ChevronRight /></a>
      <a href="/workspace/leituras"><BookOpenText /><span><b>Abrir leituras</b><small>Continue seus PDFs</small></span><ChevronRight /></a>
      {!isAgenda ? <button onClick={() => { setZen((value) => !value); setCommandOpen(false); }}><Focus /><span><b>{zen ? "Sair do foco" : "Entrar em foco"}</b><small>Controle os painéis laterais</small></span></button> : null}
    </div><footer>Atalho: <kbd>⌘⇧P</kbd></footer></section></div> : null}
  </main>;
}
