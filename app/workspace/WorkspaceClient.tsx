"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../ThemeToggle";

type Note = {
  id: number;
  title: string;
  time: string;
  group: "HOJE" | "ONTEM" | "7 DIAS";
};

const initialNotes: Note[] = [
  { id: 1, title: "Planejamento tributário", time: "10:42", group: "HOJE" },
  { id: 2, title: "Reforma tributária 2026", time: "09:15", group: "HOJE" },
  { id: 3, title: "Projeto: IA para pesquisa", time: "08:03", group: "HOJE" },
  { id: 4, title: "Ideias para artigos", time: "07:22", group: "HOJE" },
  { id: 5, title: "Jurisprudência relevante", time: "22:17", group: "ONTEM" },
  { id: 6, title: "Estratégias de conteúdo", time: "18:45", group: "ONTEM" },
  { id: 7, title: "Leituras do mês", time: "16:30", group: "ONTEM" },
  { id: 8, title: "Notas rápidas", time: "11:05", group: "ONTEM" },
  { id: 9, title: "Hábitos e rotina", time: "3d", group: "7 DIAS" },
  { id: 10, title: "Livros e aprendizados", time: "4d", group: "7 DIAS" },
  { id: 11, title: "Mapeamento de temas", time: "5d", group: "7 DIAS" },
];

const navItems = [
  ["✧", "MEMÓRIA", "Guarde o que importa."],
  ["⌾", "RACIOCÍNIO", "Organize suas ideias."],
  ["⌘", "CONEXÕES", "Descubra relações."],
  ["▣", "LEITURAS", "Leia e registre."],
];

const initialTasks = [
  { title: "Revisar precedente STJ", date: "25/05", done: false },
  { title: "Criar artigo sobre IBS e CBS", date: "27/05", done: false },
  { title: "Estudar impacto no Simples", date: "30/05", done: false },
  { title: "Levantamento de jurisprudências", date: "18/05", done: true },
];

function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mark compact" : "mark"} aria-hidden="true">
      <i className="orbit orbit-a" />
      <i className="orbit orbit-b" />
      <i className="node node-a" />
      <i className="node node-b" />
      <span>∞</span>
    </div>
  );
}

export default function WorkspaceClient({ displayName, email }: { displayName: string; email: string }) {
  const [notes, setNotes] = useState(initialNotes);
  const [activeNote, setActiveNote] = useState(1);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"edit" | "read">("edit");
  const [tasks, setTasks] = useState(initialTasks);
  const [zen, setZen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const addNote = () => {
    const nextId = Math.max(...notes.map((note) => note.id)) + 1;
    const next = { id: nextId, title: "Nota sem título", time: "agora", group: "HOJE" as const };
    setNotes((current) => [next, ...current]);
    setActiveNote(nextId);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        addNote();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const filtered = notes.filter((note) => note.title.toLowerCase().includes(query.toLowerCase()));
  const selected = notes.find((note) => note.id === activeNote) ?? notes[0];

  return (
    <main className={zen ? "workspace zen" : "workspace"}>
      <header className="topbar">
        <div className="product-name"><Mark compact /><strong>Outro Cérebro</strong></div>
        <div className="top-actions">
          <button aria-label="Buscar" onClick={() => searchRef.current?.focus()}>⌕</button>
          <button aria-label="Abrir comandos">›_</button>
          <ThemeToggle variant="icon" />
          <button aria-label="Alternar foco" onClick={() => setZen((value) => !value)}>◉</button>
          <a className="avatar" aria-label={`Conta de ${displayName}`} title={`${displayName} · ${email}`} href="/signout-with-chatgpt?return_to=%2F">{displayName.charAt(0).toUpperCase()}</a>
        </div>
      </header>

      <aside className="identity-panel">
        <div className="brand-lockup">
          <Mark />
          <div className="brand-word">OUTRO<br />CÉREBRO</div>
          <p>Seu espaço privado<br />para pensar.</p>
        </div>
        <nav aria-label="Áreas do conhecimento">
          {navItems.map(([icon, title, subtitle]) => (
            <button key={title} onClick={() => title === "LEITURAS" && (window.location.href = "/workspace/leituras")} className={title === "MEMÓRIA" ? "nav-item active" : "nav-item"}>
              <span className="nav-icon">{icon}</span>
              <span><b>{title}</b><small>{subtitle}</small></span>
            </button>
          ))}
        </nav>
        <div className="privacy"><span>♙</span><p>Uso estritamente pessoal<small>Seus dados. Suas ideias.</small></p></div>
      </aside>

      <aside className="notes-panel">
        <label className="search-box">
          <span>⌕</span>
          <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar notas..." aria-label="Buscar notas" />
          <kbd>⌘K</kbd>
        </label>
        <button className="new-note" onClick={addNote}><span>＋</span> Nova nota <i>⌄</i></button>
        <div className="note-groups">
          {(["HOJE", "ONTEM", "7 DIAS"] as const).map((group) => {
            const groupNotes = filtered.filter((note) => note.group === group);
            if (!groupNotes.length) return null;
            return (
              <section key={group} className="note-group">
                <h2>{group}</h2>
                {groupNotes.map((note) => (
                  <button key={note.id} className={activeNote === note.id ? "note-row selected" : "note-row"} onClick={() => setActiveNote(note.id)}>
                    <span>{note.title}</span><time>{note.time}</time>
                  </button>
                ))}
              </section>
            );
          })}
          {!filtered.length && <div className="empty-search">Nenhuma nota encontrada.</div>}
        </div>
        <button className="settings"><span>⚙</span> Configurações</button>
      </aside>

      <section className="editor-panel">
        <div className="editor-titlebar">
          <h1>{selected.title}</h1>
          <span>Salvo agora há pouco <b>✓</b></span>
        </div>
        <div className="mode-switch" role="tablist" aria-label="Modo da nota">
          <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>♢ &nbsp; Editar</button>
          <button className={mode === "read" ? "active" : ""} onClick={() => setMode("read")}>◉ &nbsp; Ler</button>
        </div>
        <article className={mode === "read" ? "note-content reading" : "note-content"}>
          <h2><span>#</span> {selected.title}</h2>
          <p>O planejamento tributário é uma das frentes mais importantes para redução de riscos e aumento de eficiência fiscal de pessoas e empresas.</p>
          <h3><span>##</span> Contexto</h3>
          <p>Com a chegada da <a>[[Reforma tributária]]</a> em 2026, novas oportunidades e desafios surgem para planejamento estratégico.</p>
          <h3><span>##</span> Estratégias principais</h3>
          <ul className="checklist">
            <li><span>[ ]</span> Analisar cenário atual da empresa</li>
            <li className="checked"><span>[x]</span> Revisar legislação aplicável</li>
            <li><span>[ ]</span> Identificar incentivos fiscais</li>
            <li><span>[ ]</span> Avaliar estrutura societária</li>
          </ul>
          <h3><span>##</span> Observações</h3>
          <blockquote>Planejar é projetar o presente para proteger o futuro.</blockquote>
          <h3><span>##</span> Tabela de impacto</h3>
          <div className="impact-table" role="table" aria-label="Cenários tributários">
            <div className="th">Cenário</div><div className="th">Carga Atual</div><div className="th">Carga Projetada</div><div className="th">Variação</div>
            <div>Conservador</div><div>34,2%</div><div>31,8%</div><div className="positive">-2,4%</div>
            <div>Moderado</div><div>34,2%</div><div>28,9%</div><div className="positive">-5,3%</div>
            <div>Otimista</div><div>34,2%</div><div>26,1%</div><div className="positive">-8,1%</div>
          </div>
        </article>
        <footer className="editor-footer"><span>◇ &nbsp; ⛓ &nbsp; •••</span><span>842 palavras &nbsp; 5.472 caracteres &nbsp; Markdown</span></footer>
      </section>

      <aside className="context-panel">
        <section className="context-section tasks">
          <div className="section-heading"><h2>TAREFAS</h2><button aria-label="Adicionar tarefa">＋</button></div>
          {tasks.map((task, index) => (
            <button key={task.title} className={task.done ? "task done" : "task"} onClick={() => setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item))}>
              <i>{task.done ? "✓" : ""}</i><span>{task.title}</span><time>{task.date}</time>
            </button>
          ))}
        </section>
        <section className="context-section backlinks">
          <div className="section-heading"><h2>BACKLINKS <b>3</b></h2></div>
          {["Reforma tributária 2026|#contexto", "IBS e CBS: principais pontos|#planejamento", "Incentivos fiscais regionais|#estratégias"].map((item) => {
            const [title, tag] = item.split("|");
            return <button key={title}><span>{title}</span><small>{tag}</small><i>›</i></button>;
          })}
        </section>
        <section className="context-section graph-section">
          <div className="section-heading"><h2>GRAFO DE CONHECIMENTO</h2><span>Em breve</span></div>
          <div className="knowledge-graph" aria-label="Mapa visual de conexões">
            <div className="web-lines" />
            <div className="graph-node central">Planejamento<br />tributário</div>
            <div className="graph-node n1">Reforma<br />tributária</div>
            <div className="graph-node n2">IBS e CBS</div>
            <div className="graph-node n3">Incentivos<br />fiscais</div>
            <div className="graph-node n4">Estratégia<br />empresarial</div>
            <div className="graph-node n5">Estrutura<br />societária</div>
            {Array.from({ length: 15 }).map((_, index) => <i key={index} className={`star s${index + 1}`} />)}
          </div>
          <p className="graph-caption">Visualização do grafo de conhecimento será implementada em breve com react-force-graph.</p>
        </section>
      </aside>
    </main>
  );
}
