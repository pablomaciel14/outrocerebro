# Histórico de alterações

[← Índice](../README.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## 2026-08-19 — Plataforma SaaS Jurídica, Central de Sincronização, Reconciliação Multia-abas & Gráficos Analíticos

- Área afetada: `app/dashboard/*`, `components/*`, `lib/*`, `data/*`, `package.json`, `vercel.json`.
- Corrigido/adicionado:
  - **Migração para Vercel & Next.js 16 Nativo**: Remoção de dependências legadas de Cloudflare Workers/OpenAI Sites; adoção do Next.js 16 com Turbopack e deploy direto na Vercel.
  - **Acervo Jurídico Real (3.883 Processos)**: Higienização e integração do dataset real do escritório com busca em memória ultra-rápida, paginação de 50 em 50 e visualização de fichas completas de processos (`/dashboard/processos/[id]`).
  - **Layout Corporativo e Legal Design v3**: Painel moderno e limpo com **Radar de Prazos Fatais** (colunas de 3 dias, semana, 15 dias e cumpridos no mês), strip de KPIs do acervo e barras de carga de trabalho por advogado.
  - **Correção Definitiva de Rolagem (Scroll)**: Remoção da regra legada `body { overflow: hidden; }` em `app/globals.css` e adaptação do container `<main>`, proporcionando rolagem suave e nativa em todo o sistema.
  - **Central de Sincronização & Integrações (`/dashboard/sincronizacao`)**:
    - `ImportadorPlanilha.tsx`: Motor de importação em lote para planilhas gerais do CPJ com envio via *Upsert* (sem duplicação).
    - `SincronizadorAmbar.tsx`: Motor especializado que varre automaticamente todas as 22 abas do *Relatório Jurídico Geral da Âmbar Energia*, extraindo risco de perda (*Remota, Possível, Provável*), andamento, fase e valores atualizados.
    - `SincronizadorTarefas.tsx`: Motor de conciliação de pautas pendentes e concluídas com chave única anti-duplicação (`numero_processo, evento, data_fatal`).
  - **Visualização Gráfica de Risco (Recharts)**: `GraficoRisco.tsx` com gráfico de rosca (Donut Chart) e paleta funcional de cores (Verde = Remota, Amarelo = Possível, Vermelho = Provável).
  - **Modelagem Relacional (Supabase)**: Criação das tabelas `processos` e `tarefas` com chaves únicas, constraints e índices otimizados (`idx_processos_numero`, `idx_processos_risco`, `idx_processos_responsavel`, `idx_tarefas_processo`).
- Validação: `npm run build` gerando todas as 12 rotas do Next.js sem erros em 5s; suíte de testes passando 37/37 com 100% de sucesso.










## 2026-08-16 — Documentação do fluxo obrigatório de publicação pelo Sites

- Área afetada: documentação operacional e arquitetural (`AGENTS.md`, `README.md`, `docs/02-ARQUITETURA.md`, `docs/04-OPERACAO-E-MANUTENCAO.md` e grafo da documentação).
- Corrigido: a documentação dizia que a produção era hospedada no Sites, mas não deixava explícito que o projeto também possui uma origem e versões próprias nesse sistema nem que atualizar o GitHub, sozinho, não publica `outrocerebro.com.br`. Isso permitia confundir `git push` com uma entrega em produção concluída.
- Comportamento novo: tornou-se regra permanente que toda publicação sincronize o mesmo commit validado com o projeto Sites indicado por `.openai/hosting.json`, salve uma versão, faça a implantação e aguarde o estado final de sucesso. O domínio personalizado, SSL e os bindings D1/R2 também devem ser conferidos no projeto existente; não se deve criar outra hospedagem para contornar o fluxo.
- Dados/migrações: nenhuma.
- Validação: links internos e referências ao fluxo de publicação revisados; nenhuma mudança de código executável.
- Limitações restantes: a sincronização GitHub → Sites ainda é manual; não há CI/CD que faça essa implantação automaticamente após cada push no `main`.

## 2026-08-16 — Ícones de instalação saem da tela de login; sempre visíveis no Workspace

- Área afetada: `app/page.tsx` (login); `app/globals.css` (sidebar compacta do Workspace no celular).
- Corrigido: os ícones de instalação (Desktop/Extensão/PWA) ficavam na tela de login pública, com estilo de baixo contraste (`background: rgba(255,255,255,.02)`, ícone na cor `--muted`) que os tornava fáceis de não perceber — reportado como "não aparece no site". Na barra lateral compacta do Workspace (≤780px), o contêiner dos três ícones (`flex-wrap: wrap`, 34px cada) também não tinha regra própria para a largura de ~58px disponível, arriscando ficar espremido/cortado.
- Comportamento novo: os ícones saíram da tela de login (decisão do usuário: mais seguro oferecer instalação só depois de autenticado, dentro do espaço privado) e continuam exclusivamente na barra lateral do Workspace. Na largura compacta (≤780px), o contêiner agora empilha os ícones verticalmente (`flex-direction: column`) em vez de tentar caber lado a lado, então ficam sempre visíveis e legíveis, do mesmo jeito que os itens de navegação já compactos ali ao lado.
- Dados/migrações: nenhuma.
- Validação: `npm run build` limpo; conferido no navegador que `.install-apps-container` não existe mais na tela de login; `npm test` 37/37. Não foi possível testar visualmente a barra lateral do Workspace neste ambiente (exige login autenticado, sem credenciais reais disponíveis) — a mudança de CSS foi validada só por leitura/build, recomenda-se conferir manualmente após publicar.
- Limitações restantes: o modo foco (`.zen`) continua reduzindo a opacidade de toda a barra lateral (incluindo os ícones de instalação) para 25% — comportamento existente e intencional para toda a sidebar, não alterado nesta entrega.

## 2026-08-16 — Correção: download do instalador Desktop quebrado (404)

- Área afetada: `app/InstallAppButton.tsx` (ícone de download na sidebar do Workspace e na tela de login).
- Corrigido: um commit anterior (`a5059bb`, mensagem "fix: add .nvmrc for vercel" — não relacionada ao que de fato mudou no arquivo) trocou o link de download do Desktop de uma URL do GitHub Releases para um caminho relativo (`/OutroCerebroSetup.exe`), esperando que o arquivo estivesse em `public/`. Ele nunca esteve: `git ls-files public/` confirma que só `OutroCerebroExtension.zip` existe ali, e não há CI/script que gere ou copie o `.exe` para lá. O botão ficava visível e clicável, mas resultava em 404 em produção.
- Comportamento novo: o link do `.exe` voltou a apontar para `https://github.com/pablomaciel14/outrocerebro/releases/latest/download/OutroCerebroSetup.exe` — confirmado que o release `desktop-v1.0.0` existe com esse asset anexado (`gh release view` + `curl -I` retornando 302 para o asset real). O link do `.zip` da extensão não foi alterado: `public/OutroCerebroExtension.zip` existe de verdade, então o caminho relativo já funcionava.
- Dados/migrações: nenhuma.
- Validação: `npm run build` limpo; conferido no navegador (servidor local) que o `href` renderizado bate com a URL corrigida, sem erros de console; `curl -I` na URL do GitHub Releases confirma redirecionamento 302 para o asset; `npm test` com 37/37.
- Limitações restantes: ainda não existe CI/CD publicando o instalador automaticamente (ver "O que falta / planejado" em [GRAFO-DA-DOCUMENTACAO.md](GRAFO-DA-DOCUMENTACAO.md)) — se um novo release for publicado sem o asset `OutroCerebroSetup.exe`, o link volta a quebrar silenciosamente, já que nada testa esse link automaticamente.

## 2026-08-16 — Documentação revisada por completo + hook de pre-commit

- Área afetada: toda a documentação (`README.md`, `AGENTS.md`, `docs/*.md`); novo `.githooks/pre-commit`; `package.json` (script `prepare`).
- Corrigido: várias entregas recentes de sessões concorrentes (PWA, Desktop/Electron, Extensão Chrome, menu de perfil, cobertura de testes) tinham documentação parcial ou desatualizada em vários arquivos — `README.md` ainda citava a galeria de templates como "última atualização", `docs/00-VISAO-GERAL.md` e `docs/GRAFO-DA-DOCUMENTACAO.md` não mencionavam Perfil/PWA/Desktop/Extensão/Testes, e `docs/02-ARQUITETURA.md` não descrevia `tests/`, `worker/`, `desktop/` nem `extension/`. Também encontrada uma inconsistência real: `docs/04-OPERACAO-E-MANUTENCAO.md` documentava `npx electron-packager` para gerar o instalador do Desktop, mas isso não bate com o script `build` real de `desktop/package.json` (`electron-builder -w`) nem com `desktop/build-installer.js` (`electron-winstaller`, espera uma pasta que nenhum passo atual produz e não está ligado a nenhum script `npm`).
- Comportamento novo:
  - Toda a documentação (README, AGENTS.md, os cinco `docs/NN-*.md` e o grafo) foi conferida contra o código atual e atualizada: novas seções "Perfil" e "Instalar em outras plataformas" ([01-AREAS-E-FLUXOS.md](01-AREAS-E-FLUXOS.md)), "Testes" ([02-ARQUITETURA.md](02-ARQUITETURA.md)), nota sobre o service worker não fazer cache ([03-DADOS-E-SEGURANCA.md](03-DADOS-E-SEGURANCA.md)), comando de build do Desktop corrigido e nova seção "Automação de documentação" ([04-OPERACAO-E-MANUTENCAO.md](04-OPERACAO-E-MANUTENCAO.md)), tabela de maturidade expandida ([00-VISAO-GERAL.md](00-VISAO-GERAL.md)), e o grafo ([GRAFO-DA-DOCUMENTACAO.md](GRAFO-DA-DOCUMENTACAO.md)) ganhou nós para Perfil, Testes, Clientes dedicados (Desktop/Extensão/PWA) e uma seção nova "O que falta / planejado".
  - Novo hook `git` de `pre-commit` (`.githooks/pre-commit`): bloqueia qualquer commit que mude `app/`, `db/`, `drizzle/`, `tests/` ou `worker/` sem que `docs/CHANGELOG.md` ou `AGENTS.md` também tenham mudado no mesmo commit. Ativado automaticamente por `npm install` via `git config core.hooksPath .githooks` (script `prepare` em `package.json`) — nenhuma configuração manual necessária, vale para qualquer IA ou programador que rode `npm install` uma vez. Novo `.gitattributes` fixa `.githooks/*` em final de linha LF, para o shebang do hook não quebrar em máquinas Windows com `core.autocrlf=true`.
- Dados/migrações: nenhuma.
- Validação: hook testado isoladamente (lógica de detecção de arquivos staged simulada com casos "só código", "código + changelog", "só docs", "só `public/`") — bloqueia e libera exatamente como esperado. Não pude ativar `core.hooksPath` neste ambiente (alterar configuração do git está fora do que posso fazer sozinho por segurança); ativa sozinho na próxima vez que `npm install` rodar.
- Limitações restantes: o hook detecta *se* algo em `docs/CHANGELOG.md`/`AGENTS.md` mudou, não se a mudança é relevante ou precisa de conteúdo — continua exigindo julgamento de quem commita. `git commit --no-verify` ainda pula a checagem deliberadamente. `desktop/build-installer.js` continua sem uso confirmado; ver "O que falta / planejado" no grafo.

## 2026-08-16 — Menu de perfil: tema, área padrão ao entrar e logout

- Área afetada: topbar do Workspace e de Leituras; novo `app/ProfileMenu.tsx`; nova rota `/api/preferences`; nova tabela `user_preferences`.
- Corrigido/adicionado: o botão com a inicial do nome, no canto superior direito, fazia logout imediato ao clicar (um `<form>` de submit direto), sem menu nem confirmação. A área de Leituras não tinha esse botão — não havia forma de sair de lá sem voltar manualmente ao Workspace.
- Comportamento novo:
  - O botão agora abre um menu de perfil: nome, e-mail, alternância de tema (claro/escuro), seletor de área padrão ao entrar (Memória, Raciocínio, Conexões ou Agenda) e botão **Sair** dedicado.
  - A área padrão é persistida por conta na nova tabela `user_preferences` (não em `localStorage`), então vale em qualquer dispositivo — ao abrir `/workspace` sem um `?area=` explícito (inclusive o link "Abrir meu espaço" da tela de login), o sistema usa a preferência salva em vez de sempre cair em Memória. Links de navegação para uma área específica continuam indo exatamente para aquela área.
  - O menu de perfil também foi adicionado à topbar de Leituras, então agora é possível sair diretamente de lá.
- Dados/migrações: nova tabela `user_preferences` (`drizzle/0006_aromatic_lockjaw.sql`), chave primária `user_id`, coluna `default_area` com padrão `'memoria'`.
- Validação: `npm run build` limpo, `npm run lint` limpo nos arquivos tocados, `npm test` com 37/37 (incluindo novo teste de isolamento de `userId` para `user_preferences`); prévia visual isolada do CSS do menu conferida no navegador (login/workspace autenticado não pôde ser testado neste ambiente por falta de credenciais reais).
- Limitações restantes: não há teste end-to-end automatizado clicando no menu real dentro do app (só o CSS foi validado visualmente de forma isolada); recomenda-se conferir manualmente após publicar.

## 2026-08-16 — Extensão do Chrome e Nova UI de Instalação

- Adicionada **Extensão do Google Chrome** baseada em Painel Lateral (Manifest V3) localizada em `extension/`.
- Reposicionamento dos ícones de instalação de aplicativos (Extensão, Desktop e Mobile PWA) da barra superior para a barra lateral esquerda, abaixo da logo do sistema, deixando as opções sempre acessíveis sem poluir o cabeçalho.
- O sistema consolidou sua estratégia multiplataforma *Thin Client*: Web, Desktop nativo, PWA Móvel e Extensão de Navegador compartilham e refletem 100% o site atualizado.

## 2026-08-16 — Aplicativo Desktop Oficial (Electron)

- Criado invólucro (wrapper) nativo para Windows utilizando Electron.
- O aplicativo carrega a mesma URL do sistema (`https://outrocerebro.com.br`), garantindo que qualquer mudança feita e publicada no site web reflita instantaneamente no aplicativo desktop sem necessidade de novas instalações.
- Código-fonte adicionado na pasta `desktop/`.

## 2026-08-16 — Cobertura real de testes comportamentais

- Área afetada: `tests/`; nenhum código de produção mudou de comportamento, exceto extrações internas descritas abaixo.
- Corrigido: o único arquivo de teste (`tests/rendered-html.test.mjs`) só fazia checagem de texto no código-fonte (regex tipo `assert.match(route, /rejectCrossSiteMutation/)`), nunca executando o código de fato. CSRF, isolamento de `userId` entre usuários, rejeição de PDF inválido e bloqueio de login após tentativas não tinham nenhuma verificação comportamental — um bug real nessas áreas passaria despercebido.
- Comportamento novo:
  - `rejectCrossSiteMutation`, `validUuid`, `readLimitedJson` e `sha256` (`app/security.ts`) agora têm testes comportamentais diretos com `Request` reais (`tests/security.test.mjs`).
  - A validação de upload de PDF foi extraída para `validatePdfSubmission()` em `app/security.ts` (antes inline em `app/api/readings/route.ts`) e testada com arquivos `File` reais: tipo/assinatura `%PDF-` inválidos, tamanho acima de 40 MB, metadados grandes demais, sanitização de nome de arquivo.
  - A lógica de bloqueio de login foi extraída para `app/login-throttle.ts` (antes inline em `app/api/auth/login/route.ts`) e testada: acumulação de falhas na janela de 15 min, bloqueio na 5ª falha, expiração exata do bloqueio, reset da janela, `retryAfter` nunca menor que 1s (`tests/login-throttle.test.mjs`).
  - Isolamento de `userId` entre dois usuários agora é testado contra um banco SQLite real em memória (`node:sqlite`, nativo do Node ≥22.5, sem nova dependência), rodando as migrações reais do Drizzle (`drizzle/*.sql`) e o schema real (`db/schema.ts`) via `drizzle-orm/sqlite-proxy`: páginas do workspace, agenda, leituras, destaques e marcadores são verificados como inacessíveis para um segundo usuário mesmo conhecendo o id exato, inclusive contra `DELETE` (`tests/user-isolation.test.mjs`, `tests/helpers/sqlite-db.mjs`). O mesmo harness confirmou, de forma comportamental, a cascata de exclusão de destaques/marcadores ao remover uma leitura — antes apenas descrita na documentação, nunca verificada.
  - `npm test` agora roda toda a suíte (`node --test` com autodescoberta) em vez de um único arquivo fixo.
- Dados/migrações: nenhuma.
- Validação: suíte completa executada de ponta a ponta neste ambiente — `npm test` (build + 36 testes) passou 36/36; `npm run lint` limpo nos arquivos tocados; `npm run build` gerou todas as rotas sem erro.
- Limitações restantes: os testes de isolamento validam o padrão de consulta (`id` + `userId`) contra um SQLite real com o schema de produção, não o binding D1/Worker real em si nem os handlers HTTP completos (que importam `cloudflare:workers`, não resolvível fora do runtime de Workers); uma suíte de integração real via Miniflare/`@cloudflare/vitest-pool-workers` cobriria isso, mas não foi adicionada nesta entrega.

## 2026-08-16 — Correção: identidade dupla de userId via headers do ChatGPT Apps SDK

- Área afetada: autenticação (`app/personal-auth.ts`, `app/chatgpt-auth.ts`); todo dado particionado por `userId` (páginas, agenda, leituras, destaques, marcadores e caminho dos PDFs no R2).
- Corrigido: depois de validar o cookie de sessão, `getPersonalUser()` sobrescrevia `userId` com o valor vindo dos headers `oai-authenticated-user-id`/`-email` (usados quando o app é aberto como ChatGPT App), sem nenhuma verificação de assinatura desses headers. Isso fazia dados criados via login normal e via ChatGPT ficarem em partições diferentes, e — caso os headers não fossem estritamente controlados pela camada de hospedagem — abria caminho para uma requisição com cookie válido mais um header forjado redirecionar leituras/escritas para outra partição.
- Comportamento novo: `userId` vem sempre do e-mail já verificado no cookie assinado `__Host-oc_session`. Os headers do ChatGPT Apps SDK agora só alimentam o `displayName` (cosmético); nunca autorizam acesso nem escolhem partição de dados. Documentado em [docs/03-DADOS-E-SEGURANCA.md](03-DADOS-E-SEGURANCA.md).
- Dados/migrações: nenhuma migração de schema. Se alguma sessão via ChatGPT App chegou a criar dados sob um `userId` diferente do e-mail (cenário não documentado e provavelmente nunca exercitado), esses registros deixam de ser alcançáveis por qualquer caminho de acesso; não foi feita varredura no D1 para confirmar se isso ocorreu.
- Validação: revisão manual do fluxo de autenticação e de todos os usos de `.userId` nas rotas de API; build/lint não executados neste ambiente (dependências não instaladas).
- Limitações restantes: nenhuma verificação criptográfica dos headers `oai-authenticated-user-*` foi adicionada — eles continuam não confiáveis por design; o fluxo de ChatGPT App em si permanece sem teste automatizado.

## 2026-08-16 — Correção: página de login travada em janelas baixas

- Área afetada: página de login (`/`).
- Corrigido: `body` usa `overflow: hidden` como padrão global, e `.login-page` repetia o mesmo `overflow: hidden`. Só existiam exceções por largura (`max-width: 760px`/`780px`, escopadas a Leituras/Workspace) reativando o scroll — nenhuma cobria a página de login nem tratava altura de janela insuficiente. Em qualquer largura acima desses limites (a maioria dos notebooks e tablets em paisagem) com altura de janela menor que o conteúdo do cartão de login, a parte inferior (botão de entrar, avisos, rodapé) ficava fora da tela e era impossível rolar até ela.
- Comportamento novo: `.login-page` agora é seu próprio contêiner de rolagem (`max-height: 100vh; overflow-y: auto`), independente do `overflow: hidden` do `body`. O card sempre fica totalmente alcançável, em qualquer largura ou altura de janela.
- Dados/migrações: nenhuma.
- Validação: reproduzido o travamento simulando uma janela 1024×700 (conteúdo de 886px preso, sem rolagem possível); confirmado que a correção resolve, testado via injeção do CSS na página em produção antes de aplicar no repositório.
- Limitações restantes: o mesmo padrão (`body { overflow: hidden }` só liberado por breakpoints de largura) provavelmente afeta Workspace e Leituras em janelas largas porém baixas; não foi corrigido nesta entrega por exigir validação autenticada nessas áreas.

## 2026-08-16 — Suporte a PWA e Instalação

- O sistema foi configurado como Progressive Web App (PWA).
- Adicionado Service Worker (`sw.js`) e componente de registro para cumprir os requisitos de instalabilidade.
- Adicionado botão "Instalar aplicativo" nativo e inteligente nas barras superiores (Workspace principal e Leituras).
- Adicionadas instruções contextuais para instalação no iOS (Safari).

## 2026-08-16 — Correção: perda de edições no autosave ao trocar de página

- Área afetada: Memória, Raciocínio e Conexões (editor de páginas).
- Corrigido: o debounce de salvamento automático (700 ms) era cancelado sem persistir a edição sempre que o usuário trocava de página, criava uma nova página ou fechava a aba antes do temporizador disparar — a edição era perdida sem aviso.
- Comportamento novo: ao trocar de página, criar página (template ou em branco) ou fechar/sair da aba (`beforeunload`/`pagehide`), a edição pendente é persistida imediatamente via `fetch(..., { keepalive: true })`.
- Dados/migrações: nenhuma.
- Validação: revisão manual do fluxo de edição e troca de página; build/lint não puderam ser executados neste ambiente (dependências não instaladas). Executar `npm run lint` e `npm run build` antes de publicar.
- Limitações restantes: `keepalive` limita o corpo da requisição a cerca de 64 KB; uma falha de rede durante o flush em segundo plano pode exibir o indicador de erro na página atualmente aberta, não necessariamente na página que falhou ao salvar.

## 2026-08-16 — Galeria de templates editáveis

- Adicionada galeria responsiva ao fluxo de criação de páginas.
- Incluídos cinco modelos: Planejamento semanal, Projeto pessoal, Notas de reunião, Rastreador de hábitos e Controle financeiro.
- Mantida a alternativa de página em branco.
- O atalho `⌘N` passou a abrir a galeria.
- Após a escolha, a página é persistida no D1 e aberta no editor.
- Título, emoji e conteúdo podem ser completamente editados.
- A área de Leituras foi preservada sem alterações.

## 2026-08-16 — Workspace editável e Agenda

- Memória, Raciocínio e Conexões passaram a usar páginas persistentes.
- Adicionados busca, favoritos, Markdown simples, visualização, exclusão e salvamento automático.
- Adicionado menu de blocos acionado por `/`.
- Criada Agenda mensal com tarefas, compromissos, horários, cores e conclusão.
- Adicionadas tabelas `workspace_pages` e `agenda_items` ao D1.

## 2026-08-16 — Navegação móvel e documentação inicial

- Itens do menu passaram a ser links HTML reais.
- Alvos de toque dos ícones foram ampliados.
- Criado README técnico inicial.

## Entregas anteriores consolidadas

- autenticação pessoal com Supabase Auth;
- sessão assinada e proteção de APIs;
- upload e armazenamento privado de PDFs;
- extração de Markdown;
- progresso e cronômetro de leitura;
- marcadores, destaques coloridos e notas;
- leitor móvel com gestos, alta nitidez e retomada;
- temas claro e escuro;
- domínio `outrocerebro.com.br`.

## Como registrar próximas mudanças

Adicionar uma seção no topo com data, nome da entrega, áreas afetadas, comportamento novo, dados/migrações, validação e limitações restantes.
