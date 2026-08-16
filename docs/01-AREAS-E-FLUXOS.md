# Áreas e fluxos funcionais

[← Visão geral](00-VISAO-GERAL.md) · [Próximo: arquitetura →](02-ARQUITETURA.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Login

Rota: `/`

- Comunica claramente que o sistema é pessoal e não comercial.
- Recebe e-mail e senha.
- Encaminha as credenciais ao servidor; a senha não fica armazenada no projeto.
- Redireciona para o workspace somente após autenticação.

## Memória

Rota: `/workspace`

Espaço para registrar informações que precisam ser lembradas: notas, referências, fatos, ideias rápidas e material de consulta.

Funcionalidades:

- criar, pesquisar, selecionar, editar, visualizar, favoritar e excluir páginas;
- escolher emoji/ícone da página;
- salvar automaticamente;
- escrever Markdown simples;
- inserir blocos de título, tarefa e citação com `/`;
- usar templates ou começar em branco.

## Raciocínio

Rota: `/workspace?area=raciocinio`

Espaço para desenvolver questões, hipóteses, argumentos, análises e decisões. Usa o mesmo editor persistente de páginas, mas separa os registros por `area = raciocinio`.

Um fluxo típico é: questão → contexto → hipóteses → decisão → próxima ação.

## Conexões

Rota: `/workspace?area=conexoes`

Espaço para aproximar temas, pessoas, projetos e referências. Páginas podem usar a convenção textual `[[Nome da página]]`.

Limitação atual: os marcadores `[[...]]` ainda são texto editável; backlinks e grafo automático entre páginas não são calculados pelo servidor nesta versão.

## Templates

A galeria aparece ao clicar em **Nova página**, nos botões de estado vazio ou pelo atalho `⌘N`.

| Template | Uso |
| --- | --- |
| Planejamento semanal | objetivos, prioridades e tarefas por dia |
| Projeto pessoal | objetivo, etapas, recursos, decisões e ações |
| Notas de reunião | pauta, participantes, decisões e responsáveis |
| Rastreador de hábitos | acompanhamento semanal e reflexão |
| Controle financeiro | receitas, despesas, saldo e metas |

O template apenas fornece uma estrutura inicial. Depois da escolha, título, emoji e conteúdo podem ser completamente alterados. A página em branco permanece disponível.

## Agenda

Rota: `/workspace?area=agenda`

- calendário mensal com seis semanas visíveis;
- seleção de dia;
- criação de tarefa ou compromisso;
- horários inicial e final para compromissos;
- cinco cores de organização;
- conclusão e reabertura de tarefas;
- exclusão com confirmação;
- painel de itens do dia;
- próximos itens exibidos também no contexto das páginas.

No celular, o mês usa marcadores compactos e o detalhamento do dia aparece abaixo do calendário.

## Leituras

Rota: `/workspace/leituras`

### Biblioteca

- upload de PDF de até 40 MB;
- arquivo privado e associado ao proprietário;
- status `Desejo ler`, `Lendo` e `Já lido`;
- exclusão do registro e do arquivo;
- retomada da última página.

### Leitor de PDF

- renderização nítida adaptada à densidade da tela;
- navegação por página, toque e gesto lateral;
- modo imersivo e temas de leitura;
- carregamento por intervalo de bytes;
- marcadores de página;
- destaques em cinco cores;
- notas opcionais ligadas ao destaque;
- cronômetro acumulado de leitura.

### Markdown da leitura

- texto extraído no navegador e separado por página;
- links preservados quando reconhecidos;
- busca no conteúdo;
- destaques e notas também na representação Markdown;
- layout que não ultrapassa a largura da tela.

PDFs apenas escaneados continuam visíveis, mas exigirão OCR futuro para gerar texto útil.

## Navegação e comandos

- `⌘K` ou `Ctrl+K`: busca de páginas.
- `⌘N` ou `Ctrl+N`: galeria de templates.
- `⌘⇧P` ou `Ctrl+Shift+P`: ações rápidas.
- `/` em linha vazia: menu de blocos.

Os ícones do menu móvel são links HTML reais e possuem alvos de toque ampliados.
