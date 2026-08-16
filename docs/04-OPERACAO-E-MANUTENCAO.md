# Operação, manutenção e publicação

[← Dados e segurança](03-DADOS-E-SEGURANCA.md) · [Histórico →](CHANGELOG.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Ambiente local

Requisito: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```

## Banco de dados

Após alterar `db/schema.ts`:

```bash
npm run db:generate
```

Inspecionar o SQL gerado em `drizzle/` antes de publicar. Não editar migrações já aplicadas; criar uma nova migração.

## Checklist para alterações

1. Ler `AGENTS.md` e os documentos ligados à área afetada.
2. Verificar o estado do Git e preservar mudanças que não pertencem à tarefa.
3. Manter APIs autenticadas e filtradas por `userId`.
4. Aplicar proteção de origem a toda mutação.
5. Não misturar bytes de arquivo com dados estruturados.
6. Validar teclado, toque e largura móvel em mudanças de interação.
7. Executar build e testes.
8. Atualizar `docs/CHANGELOG.md` e, se necessário, o estado em `AGENTS.md`.
9. Publicar somente a versão exata que foi validada.

## Cuidados por área

### Workspace

- Templates devem criar registros normais em `workspace_pages`.
- O salvamento automático usa atraso para evitar uma requisição por tecla.
- Mudanças em Memória, Raciocínio e Conexões não devem afetar Leituras por acidente.

### Agenda

- Datas usam `YYYY-MM-DD` no armazenamento.
- Horários usam `HH:MM`.
- Cores aceitas: `violet`, `cyan`, `green`, `amber`, `coral`.

### Leituras

- Não tornar o bucket público.
- Preservar suporte a `Range` para PDF no celular.
- Manter PDF.js carregado dinamicamente.
- Testar nitidez, retomada, toque lateral, destaques e largura do Markdown após alterações.

## Publicação

- Hospedagem de produção: Sites.
- Domínio principal: <https://outrocerebro.com.br>.
- Repositório de código: GitHub.
- O projeto publicado usa os bindings D1 e R2 declarados em `.openai/hosting.json`.

## Documentação viva

Toda entrega relevante deve responder no changelog:

- o que mudou;
- quais áreas foram afetadas;
- o que foi preservado;
- como foi validado;
- quais limitações permanecem.
