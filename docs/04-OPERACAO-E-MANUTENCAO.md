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

`npm install` também ativa o hook de pre-commit do projeto (script `prepare`, ver [Automação de documentação](#automação-de-documentação) abaixo) — não é preciso configurar nada manualmente.

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
8. Atualizar `docs/CHANGELOG.md` e, se necessário, o estado em `AGENTS.md` — o hook de pre-commit bloqueia o commit se código mudou sem isso (ver abaixo).
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

## Clientes da Plataforma (Desktop, Extensão e Mobile)

O sistema possui clientes dedicados na pasta `desktop/` (Aplicativo Windows via Electron) e `extension/` (Extensão Google Chrome via Manifest V3).
Eles não rodam o código do projeto localmente, mas sim atuam como navegadores dedicados (Thin Clients) que carregam a versão de produção `https://outrocerebro.com.br` (Desktop via `loadURL`, Extensão via `<iframe>` no painel lateral).
A versão Mobile e Tablet funciona através de um PWA instalável (`public/sw.js`, sem cache — só cumpre o requisito de instalabilidade).
Os três ficam acessíveis pelos ícones na barra lateral do Workspace (`app/InstallAppButton.tsx`).

**Regra de ouro:** Como os clientes carregam o site de produção em tempo real, **nenhuma atualização é necessária nos instaladores/arquivos zip quando você altera o código do sistema**. Todas as mudanças publicadas no web refletem imediatamente no Desktop, na Extensão e no Mobile na próxima inicialização. Só é preciso gerar um novo instalador/zip se o próprio empacotamento mudar (ícone, nome, permissões do manifest, versão do Electron).

Para gerar um novo instalador do Desktop (comando definido em `desktop/package.json`, via `electron-builder`):
```bash
cd desktop
npm install
npm run build
```
Gera o instalador NSIS em `desktop/dist/`. O arquivo `desktop/build-installer.js` (via `electron-winstaller`) também existe no repositório mas não está ligado a nenhum script `npm` e espera uma pasta (`dist/Outro Cerebro-win32-x64/`) que nenhum passo atual produz — trate-o como ferramental legado/não confirmado até validar com quem o adicionou, e não documente um segundo comando "oficial" baseado nele sem testar.

Extensão: o conteúdo de `extension/` é publicado manualmente como `.zip` (ver `public/OutroCerebroExtension.zip`) e anexado a um GitHub Release; não há workflow de CI que automatize isso.

## Automação de documentação

O repositório inclui um hook de `pre-commit` (`.githooks/pre-commit`) que **bloqueia o commit** se arquivos em `app/`, `db/`, `drizzle/`, `tests/` ou `worker/` mudaram sem que `docs/CHANGELOG.md` ou `AGENTS.md` também tenham mudado no mesmo commit — vale para qualquer IA ou programador, não é opcional por convenção, é enforçado pelo git.

- Ativado automaticamente por `npm install` (script `prepare` em `package.json`, que roda `git config core.hooksPath .githooks`). Não precisa configurar nada à mão.
- O hook não escreve a documentação por você — ele só impede o commit e lista os arquivos de código que mudaram, para lembrar o que precisa ser descrito.
- Se a mudança também afeta arquitetura, dados/segurança, áreas/fluxos ou operação, atualize o `docs/NN-*.md` correspondente; se surgiu uma área, rota ou cliente novo, atualize também o grafo em `docs/GRAFO-DA-DOCUMENTACAO.md`.
- Pular a checagem (`git commit --no-verify`) é possível mas não deve virar hábito — só faz sentido para commits que genuinamente não mudam comportamento (ex.: reformatação pura).

## Publicação

- Hospedagem de produção: Sites.
- Domínio principal: <https://outrocerebro.com.br>.
- Repositório principal de código: GitHub (`pablomaciel14/outrocerebro`, branch `main`).
- O projeto publicado usa os bindings D1 e R2 declarados em `.openai/hosting.json`.

### Fluxo obrigatório de produção

O app também existe no sistema Sites, que mantém um repositório de origem próprio e versões implantáveis do projeto. Esse repositório não substitui o GitHub: ele é a etapa de entrega da hospedagem. Por isso, **um commit ou push no GitHub, isoladamente, não atualiza `outrocerebro.com.br`**.

Toda publicação deve seguir esta sequência:

1. confirmar que o checkout está no commit exato do `main` que será publicado;
2. executar build, testes e a revisão de segurança proporcional à mudança;
3. enviar o commit ao GitHub;
4. sincronizar o mesmo commit com o repositório de origem do projeto Sites indicado por `.openai/hosting.json`;
5. empacotar a saída validada, salvar uma nova versão no Sites e implantá-la em produção;
6. aguardar o Sites informar sucesso e confirmar que o domínio personalizado e o SSL continuam ativos.

Não considerar uma entrega publicada apenas porque o GitHub está atualizado. A publicação só termina depois da confirmação de sucesso do Sites. Migrações D1 e recursos R2 continuam vinculados ao projeto Sites existente; não criar outro projeto de hospedagem para contornar falhas de publicação.

## Documentação viva

Toda entrega relevante deve responder no changelog:

- o que mudou;
- quais áreas foram afetadas;
- o que foi preservado;
- como foi validado;
- quais limitações permanecem.
