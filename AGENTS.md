# Instruções para IAs e mantenedores — Outro Cérebro

Leia este arquivo antes de alterar o projeto. Ele é o ponto de entrada permanente para qualquer IA ou programador que abrir esta pasta.

## Identidade do produto

O **Outro Cérebro** é o sistema pessoal, privado e não comercial de organização de conhecimento de Pablo Maciel. Não é SaaS, não possui cadastro público, planos, vendas, múltiplos clientes nem colaboração entre usuários.

Site principal: <https://outrocerebro.com.br>

## Mapa obrigatório de leitura

1. [Visão geral e conceito](docs/00-VISAO-GERAL.md)
2. [Áreas e fluxos funcionais](docs/01-AREAS-E-FLUXOS.md)
3. [Arquitetura e estrutura do código](docs/02-ARQUITETURA.md)
4. [Dados, autenticação e segurança](docs/03-DADOS-E-SEGURANCA.md)
5. [Operação, manutenção e publicação](docs/04-OPERACAO-E-MANUTENCAO.md)
6. [Grafo navegável da documentação](docs/GRAFO-DA-DOCUMENTACAO.md)
7. [Histórico de alterações](docs/CHANGELOG.md)

## Regras que não podem ser quebradas

- Preservar o caráter pessoal e de usuário único.
- Nunca colocar senhas, tokens ou chaves secretas no código ou na documentação.
- Autenticar páginas privadas e todas as APIs de dados.
- Filtrar todo registro persistente por `userId`.
- Proteger mutações contra requisições entre sites com `rejectCrossSiteMutation()` ou proteção equivalente.
- Manter PDFs privados no R2; nunca expor o bucket publicamente.
- Usar D1 para dados estruturados e R2 para arquivos.
- Preservar a divisão atual: Supabase somente para autenticação; D1/R2 para dados do produto.
- Tratar a área de Leituras com cuidado especial: alterações no workspace geral não devem modificar o leitor sem pedido explícito.
- Atualizar [CHANGELOG.md](docs/CHANGELOG.md) e a seção “Estado atual” deste arquivo após cada entrega relevante. Isso é enforçado por um hook de `git` (ver [Operação — Automação de documentação](docs/04-OPERACAO-E-MANUTENCAO.md#automação-de-documentação)); não usar `git commit --no-verify` para contornar essa checagem sem um motivo real.
- Manter Desktop (`desktop/`), Extensão (`extension/`) e PWA como *thin clients* sem lógica própria — eles só carregam `https://outrocerebro.com.br`; não duplicar funcionalidades do produto dentro deles.
- Tratar o Sites como parte obrigatória da infraestrutura de produção: o GitHub é o repositório principal do código, mas `git push` sozinho não publica `outrocerebro.com.br`. Toda publicação deve enviar o commit validado ao repositório de origem do projeto Sites, salvar uma versão no Sites, implantá-la e aguardar a confirmação de sucesso do domínio.

## Estado atual

- Plataforma 100% migrada para **Next.js 16 (Turbopack)** com deploy automatizado via **Vercel** e GitHub.
- Painel de Gestão Jurídica v3 consolidado nas rotas `/dashboard`, `/dashboard/processos`, `/dashboard/processos/[id]`, `/dashboard/equipe`, `/dashboard/prazos`, `/dashboard/financeiro`, `/dashboard/configuracoes` e `/dashboard/sincronizacao`.
- Central de Sincronização & Integrações ativa com três motores: Importador Geral do CPJ, Sincronizador Multia-abas Âmbar Energia (22 abas) e Sincronizador de Tarefas/Prazos com Upsert idempotente no Supabase PostgreSQL.
- Gráfico de Rosca de Prognóstico de Risco (Recharts) com cores funcionais (Remota, Possível, Provável).
- Rolagem (scroll) nativa, suave e fluida em todas as páginas após correção de `overflow` em `globals.css` e no layout.
- Proteção de rotas centralizada via `middleware.ts` e `requirePersonalUser`.
- Paginação rápida no cliente e servidor sobre o acervo real de 3.883 processos.
- Ficha completa de processo com modal interativo de edição e sincronização.
- Cobertura de testes comportamentais reais (37/37) em `tests/`.

## Última atualização funcional

Em **19 de agosto de 2026**, foi consolidada a **Plataforma SaaS de Gestão Jurídica & Central de Sincronização**:
1. **Infraestrutura**: Migração definitiva para Vercel com Next.js 16 nativo.
2. **Central de Integrações (`/dashboard/sincronizacao`)**: Três motores de importação (`ImportadorPlanilha`, `SincronizadorAmbar` e `SincronizadorTarefas`) que leem arquivos `.xlsx` no navegador e gravam diretamente no Supabase PostgreSQL via *Upsert* sem duplicações.
3. **Analytics**: Gráfico Donut de prognóstico de risco (Recharts) integrado à Visão Geral do Dashboard.
4. **Legal Design v3 & Acervo**: Radar de Prazos Fatais, strip de KPIs (3.927 processos, R$ 1,84M previstos), data grid paginado de 50 em 50 e visualização de carga por advogado.

Em **16 de agosto de 2026**, o fluxo de publicação foi documentado de forma explícita: além do repositório principal no GitHub, o app possui um projeto no **Sites**, responsável pela produção em `outrocerebro.com.br`, pelos bindings D1/R2 e pela implantação. Um push ao GitHub não atualiza o site sozinho; toda entrega deve passar pelo repositório de origem, salvamento de versão e implantação do Sites, aguardando o estado final de sucesso (ver [Operação — Publicação](docs/04-OPERACAO-E-MANUTENCAO.md#publicação)).

Antes disso, foi adicionado o **menu de perfil**, acessível pelo botão com a inicial do nome no canto superior direito. Mostra nome/e-mail, alterna tema, define a área padrão ao entrar (persistida por conta em `user_preferences`) e oferece logout — antes esse botão fazia logout imediato ao clicar, sem menu, e a área de Leituras não tinha nenhuma forma de sair.

Antes disso, o sistema foi expandido para se tornar uma plataforma multiplataforma (Web, PWA, Desktop e Extensão):
- **Aplicativo Desktop nativo** para Windows usando Electron (`desktop/`).
- **Extensão para Google Chrome** baseada em Painel Lateral (`extension/`).
- **Instalação PWA** otimizada para celulares e tablets (`public/sw.js`).

Todos os aplicativos (Desktop, Extensão e PWA) empacotam e renderizam a versão web (`https://outrocerebro.com.br`). Por conta desta arquitetura de *Thin Client*, **qualquer alteração no código web que for publicada será refletida instantaneamente no aplicativo desktop, na extensão e no celular**, sem necessidade de gerar novos instaladores ou atualizar o aplicativo localmente. O usuário pode baixar todos os aplicativos através dos ícones localizados na barra lateral esquerda da aplicação.

## Comandos essenciais

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
npm run db:generate
```

Antes de publicar: executar build, testes, revisão de segurança proporcional à alteração e conferir se migrações necessárias estão em `drizzle/`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
