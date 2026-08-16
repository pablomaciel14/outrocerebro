# Histórico de alterações

[← Índice](../README.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## 2026-08-16 — Aplicativo Desktop Oficial (Electron)

- Criado invólucro (wrapper) nativo para Windows utilizando Electron.
- O aplicativo carrega a mesma URL do sistema (`https://outrocerebro.com.br`), garantindo que qualquer mudança feita e publicada no site web reflita instantaneamente no aplicativo desktop sem necessidade de novas instalações.
- Código-fonte adicionado na pasta `desktop/`.

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
