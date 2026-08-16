# Histórico de alterações

[← Índice](../README.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## 2026-08-16 — Correção: perda de edições no autosave ao trocar de página

- Área afetada: Memória, Raciocínio e Conexões (editor de páginas).
- Corrigido: o debounce de salvamento automático (700 ms) era cancelado sem persistir a edição sempre que o usuário trocava de página, criava uma nova página ou fechava a aba antes do temporizador disparar — a edição era perdida sem aviso.
- Comportamento novo: ao trocar de página, criar página (template ou em branco) ou fechar/sair da aba (`beforeunload`/`pagehide`), a edição pendente é persistida imediatamente via `fetch(..., { keepalive: true })`.
- Dados/migrações: nenhuma.
- Validação: revisão manual do fluxo de edição e troca de página; build/lint não puderam ser executados neste ambiente (dependências não instaladas). Executar `npm run lint` e `npm run build` antes de publicar.
- Limitações restantes: `keepalive` limita o corpo da requisição a cerca de 64 KB; uma falha de rede durante o flush em segundo plano pode exibir o indicador de erro na página atualmente aberta, não necessariamente na página que falhou ao salvar.

## 2026-08-16 — Galeria de templates editáveis

Última atualização funcional.

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
