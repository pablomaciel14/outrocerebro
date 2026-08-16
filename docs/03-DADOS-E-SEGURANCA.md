# Dados, autenticação e segurança

[← Arquitetura](02-ARQUITETURA.md) · [Próximo: operação →](04-OPERACAO-E-MANUTENCAO.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Armazenamento

| Serviço | Conteúdo |
| --- | --- |
| Supabase Auth | validação de e-mail e senha |
| Cloudflare D1 / SQLite | páginas, agenda, leituras, progresso, destaques, notas, marcadores e tentativas de login |
| Cloudflare R2 | arquivos PDF privados |
| `localStorage` | somente preferências locais de tema e aparência |

Bindings lógicos em `.openai/hosting.json`:

- `DB`: D1.
- `PDF_FILES`: R2.

## Modelo de dados

O esquema é definido em `db/schema.ts`.

| Tabela | Finalidade |
| --- | --- |
| `workspace_pages` | páginas das áreas, Markdown, emoji, favorito e datas |
| `agenda_items` | tarefas e compromissos, data, horário, cor e conclusão |
| `readings` | metadados do PDF, Markdown, status, página e tempo |
| `highlights` | origem, página, trecho, cor, nota e retângulos |
| `bookmarks` | páginas marcadas de cada leitura |
| `login_attempts` | limitação de tentativas de autenticação |

Todo registro de produto possui `userId`. Toda consulta deve combinar o identificador do registro com o usuário autenticado.

## Autenticação

1. A entrada envia credenciais a `POST /api/auth/login`.
2. O servidor aceita somente o e-mail configurado em `AUTHORIZED_EMAIL`.
3. O Supabase Auth valida a senha.
4. O servidor cria o cookie assinado `__Host-oc_session`.
5. O cookie é `HttpOnly`, `Secure`, `SameSite=Strict`, prioridade alta e duração máxima de 12 horas.
6. Páginas privadas usam `requirePersonalUser()`.
7. APIs usam `getPersonalUser()` e rejeitam acesso sem sessão.

### Headers do ChatGPT Apps SDK

O app também pode ser aberto como um ChatGPT App (ver `.openai/hosting.json`). Nesse caso a plataforma da OpenAI envia os headers `oai-authenticated-user-id`, `oai-authenticated-user-email` e `oai-authenticated-user-full-name` (lidos em `app/chatgpt-auth.ts`).

- Esses headers **não são assinados nem verificados** pelo servidor; qualquer requisição pode enviá-los.
- Por isso, `userId` — a chave usada para particionar todo dado no D1 e no caminho de arquivos no R2 — vem **sempre** do e-mail já verificado no cookie `__Host-oc_session`, nunca dos headers.
- Os headers só alimentam `displayName` (texto cosmético exibido na interface); nunca autorizam acesso nem determinam qual partição de dados é lida ou escrita.

## Camadas de segurança

- usuário único e allowlist de e-mail;
- limitação de tentativas de login;
- mensagens de falha genéricas;
- sessão HMAC SHA-256 com segredo forte;
- proteção de mutações por origem e `Sec-Fetch-Site`;
- limites de tamanho de JSON, Markdown e PDF;
- validação de UUID;
- verificação da assinatura `%PDF-`;
- normalização do nome de arquivo;
- PDF com `private, no-store`, `nosniff` e sandbox;
- bucket R2 privado;
- exclusão compensatória do R2 se o registro D1 falhar;
- cascata para destaques e marcadores de uma leitura removida.

## Variáveis de ambiente

```text
AUTHORIZED_EMAIL
SESSION_SECRET
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

Regras:

- nunca documentar valores reais;
- nunca versionar `.env.local`;
- nunca usar chave `service_role` no cliente;
- nunca colocar segredo em variável `NEXT_PUBLIC_*`;
- manter `.env.example` apenas com nomes e exemplos inofensivos.

## Limites e riscos conhecidos

- O parser de Markdown do workspace é intencionalmente simples.
- `[[Links internos]]` ainda não geram backlinks automaticamente.
- PDF escaneado não recebe OCR.
- A exclusão de página e item da agenda depende de confirmação no cliente.
- Como é um produto pessoal, não existe modelo de permissões para múltiplos usuários; não presumir que a arquitetura já suporte colaboração.
