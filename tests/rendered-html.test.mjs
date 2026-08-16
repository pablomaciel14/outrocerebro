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
