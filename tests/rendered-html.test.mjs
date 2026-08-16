import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("workspace exposes editable knowledge areas and agenda navigation", async () => {
  const [page, client] = await Promise.all([
    readFile(new URL("app/workspace/page.tsx", root), "utf8"),
    readFile(new URL("app/workspace/WorkspaceClient.tsx", root), "utf8"),
  ]);

  assert.match(page, /"agenda"/);
  assert.match(client, /Nova página/);
  assert.match(client, /Salvo automaticamente/);
  assert.match(client, /\/workspace\?area=agenda/);
  assert.match(client, /Compromisso/);
  assert.match(client, /Lista de tarefas/);
  assert.match(client, /Planejamento semanal/);
  assert.match(client, /Rastreador de hábitos/);
  assert.match(client, /Controle financeiro/);
  assert.match(client, /Começar com página em branco/);
  assert.match(client, /\/workspace\/leituras/);
});

test("workspace persistence remains authenticated and owner-scoped", async () => {
  const [route, schema] = await Promise.all([
    readFile(new URL("app/api/workspace/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
  ]);

  assert.match(route, /getPersonalUser/);
  assert.match(route, /rejectCrossSiteMutation/);
  assert.match(route, /eq\(workspacePages\.userId, ownerId\)/);
  assert.match(route, /eq\(agendaItems\.userId, ownerId\)/);
  assert.match(schema, /workspace_pages/);
  assert.match(schema, /agenda_items/);
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
