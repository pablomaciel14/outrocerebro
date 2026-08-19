import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("dashboard exposes KPIs, process management, and team workload navigation", async () => {
  const [dashboardPage, processosPage, equipePage] = await Promise.all([
    readFile(new URL("app/dashboard/page.tsx", root), "utf8"),
    readFile(new URL("app/dashboard/processos/page.tsx", root), "utf8"),
    readFile(new URL("app/dashboard/equipe/page.tsx", root), "utf8"),
  ]);

  assert.match(dashboardPage, /Radar de prazos/);
  assert.match(dashboardPage, /ACERVO TOTAL/);
  assert.match(processosPage, /Acervo de Processos/);
  assert.match(processosPage, /filtroMateria/);
  assert.match(equipePage, /Equipe & Distribuição de Carga/);
});

test("dashboard routes and login remain authenticated and protected", async () => {
  const [layout, loginPage, middleware] = await Promise.all([
    readFile(new URL("app/dashboard/layout.tsx", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("middleware.ts", root), "utf8"),
  ]);

  assert.match(layout, /requirePersonalUser/);
  assert.match(loginPage, /\/dashboard/);
  assert.match(middleware, /isDashboardRoute/);
});


test("documentation gives maintainers and AIs a linked project map", async () => {
  const [agents, readme, graph, changelog] = await Promise.all([
    readFile(new URL("AGENTS.md", root), "utf8"),
    readFile(new URL("README.md", root), "utf8"),
    readFile(new URL("docs/GRAFO-DA-DOCUMENTACAO.md", root), "utf8"),
    readFile(new URL("docs/CHANGELOG.md", root), "utf8"),
  ]);

  assert.match(agents, /ponto de entrada permanente/i);
  assert.match(agents, /docs\/00-VISAO-GERAL\.md/);
  assert.match(readme, /AGENTS\.md/);
  assert.match(graph, /flowchart TD/);
  assert.match(graph, /click READ/);
  assert.match(changelog, /Galeria de templates editáveis/);
});
