# Outro Cérebro

Documento de contexto funcional e técnico do sistema. Este arquivo deve ser lido primeiro por qualquer pessoa ou IA que for manter o projeto.

## Visão geral

O **Outro Cérebro** é um sistema pessoal e não comercial de organização de conhecimento. Ele reúne notas, leitura de PDFs, texto convertido para Markdown, destaques, anotações, marcadores, progresso e tempo de leitura.

- Site principal: `https://outrocerebro.com.br`
- Proprietário e único usuário autorizado: Pablo Maciel
- Idioma da interface: português do Brasil
- Temas: escuro e claro
- Plataformas: computador, tablet e celular

O endereço é publicamente acessível somente até a tela inicial. O conteúdo e as APIs exigem a sessão pessoal do proprietário.

## O que o sistema faz

### Espaço de conhecimento

- Apresenta as áreas Memória, Raciocínio, Conexões e Leituras.
- Exibe notas, tarefas, backlinks e uma representação visual de grafo.
- Oferece busca, criação rápida de nota, modo de leitura e modo foco.
- Possui uma central de ações rápidas acessível pela barra superior.

> Estado atual: a tela de notas, tarefas, Raciocínio e Conexões ainda é uma interface demonstrativa mantida no estado do navegador. Esses dados não são persistidos. A biblioteca de Leituras é a parte funcional e persistente do produto.

### Biblioteca de leituras

- Faz upload de PDFs de até 40 MB.
- Extrai o texto do PDF no navegador e o transforma em Markdown dividido por página.
- Preserva links encontrados no texto e cria uma visualização de conexões por domínio.
- Mantém os estados `Desejo ler`, `Lendo` e `Já lido`.
- Salva a página atual e retoma a leitura de onde o usuário parou.
- Registra o tempo total de leitura com cronômetro.
- Permite marcar páginas e destacar trechos no PDF ou no Markdown.
- Oferece cinco cores de destaque e notas opcionais em cada trecho.
- Possui temas de leitura, busca no texto, modo imersivo e navegação por toque ou gesto lateral.
- Renderiza PDFs em alta densidade para manter as letras nítidas em telas Retina, respeitando um limite de memória para celulares.
- Carrega PDFs por intervalos de bytes para evitar transferir o arquivo inteiro a cada página.

PDFs digitalizados sem camada de texto continuam visíveis, mas a conversão para Markdown indicará que a página não possui texto extraível. OCR ainda não foi implementado.

## Navegação

| Área | Endereço | Situação |
| --- | --- | --- |
| Login | `/` | Funcional |
| Memória | `/workspace` | Interface demonstrativa |
| Raciocínio | `/workspace?area=raciocinio` | Visão contextual demonstrativa |
| Conexões | `/workspace?area=conexoes` | Visão contextual demonstrativa |
| Leituras | `/workspace/leituras` | Funcional e persistente |

No celular, cada ícone do menu é um link HTML real, com área de toque ampliada. Isso evita depender de eventos de clique aplicados apenas ao desenho do ícone.

## Arquitetura

### Interface e execução

- React 19 e TypeScript.
- Vinext com Vite, gerando aplicação compatível com Cloudflare Workers.
- Hospedagem pelo Sites, com domínio personalizado.
- `lucide-react` para ícones vetoriais leves e consistentes.
- `pdfjs-dist` na distribuição legada, escolhida para compatibilidade com navegadores móveis.
- CSS próprio em `app/globals.css`, sem biblioteca visual pesada.

### Persistência

- **Cloudflare D1 / SQLite:** metadados de leituras, progresso, cronômetro, destaques, notas, marcadores e tentativas de login.
- **Cloudflare R2:** arquivos PDF privados. Os PDFs não ficam no Supabase.
- **Supabase Auth:** verifica o e-mail e a senha no login. O projeto não usa Supabase Database nem Supabase Storage neste momento.
- **localStorage:** somente preferências locais de tema e aparência do leitor.

As ligações lógicas do Sites estão em `.openai/hosting.json`:

- `DB`: banco D1.
- `PDF_FILES`: bucket R2.

## Modelo de dados

O esquema está em `db/schema.ts`.

- `readings`: título, arquivo, chave R2, Markdown, estado, página atual, total de páginas, tempo e datas.
- `highlights`: leitura, origem PDF/Markdown, página, trecho, cor, nota e retângulos visuais.
- `bookmarks`: leitura e página marcada; há unicidade por usuário, leitura e página.
- `login_attempts`: contador e bloqueio temporário de tentativas de autenticação.

Todos os registros persistentes carregam `userId`, e as consultas de leitura e alteração filtram pelo usuário autenticado.

## Fluxo de autenticação

1. A tela inicial envia e-mail e senha para `POST /api/auth/login`.
2. O servidor exige que o e-mail seja exatamente o configurado em `AUTHORIZED_EMAIL`.
3. A senha é verificada pela API oficial do Supabase Auth usando a chave publicável.
4. Após sucesso, o sistema cria o cookie assinado `__Host-oc_session`.
5. O cookie é `HttpOnly`, `Secure`, `SameSite=Strict`, tem prioridade alta e validade máxima de 12 horas.
6. Páginas privadas usam `requirePersonalUser()`. APIs privadas usam `getPersonalUser()`.

Nunca colocar senha, `SESSION_SECRET`, chave secreta ou chave `service_role` no código, documentação ou variáveis `NEXT_PUBLIC_*`.

## Segurança aplicada

- Limitação de tentativas de login por identificador derivado do IP.
- Mensagens de erro de login genéricas.
- Sessão assinada com HMAC SHA-256 e segredo de no mínimo 32 bytes.
- Validação de origem e `Sec-Fetch-Site` em requisições que alteram dados.
- Limites de tamanho para JSON, PDFs e Markdown.
- Verificação da assinatura `%PDF-` antes do armazenamento.
- Validação de UUIDs e normalização de nomes de arquivos.
- PDFs entregues como privados, sem cache público, com `nosniff` e suporte seguro a intervalos de bytes.
- Exclusão do arquivo R2 quando a criação do registro falha.
- Exclusão em cascata de destaques e marcadores associados à leitura.

## Variáveis de ambiente

O ambiente publicado precisa destas chaves, configuradas na hospedagem e nunca versionadas:

```text
AUTHORIZED_EMAIL
SESSION_SECRET
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

`.env.example` deve conter somente nomes e exemplos inofensivos. `.env.local` é privado e ignorado pelo Git.

## Estrutura principal

```text
app/
  api/auth/           login e logout
  api/readings/       upload, listagem, PDF, progresso e exclusão
  api/highlights/     destaques e notas
  api/bookmarks/      marcadores de página
  workspace/          painel principal
  workspace/leituras/ biblioteca e leitor
  personal-auth.ts    criação e validação da sessão
  security.ts         validações compartilhadas
db/schema.ts          tabelas D1/SQLite
drizzle/              migrações
public/               logos, favicons, manifesto e worker do PDF.js
.openai/hosting.json  bindings lógicos do Sites
```

## Desenvolvimento local

Requisito: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
npm test
```

- `npm run dev`: desenvolvimento local.
- `npm run build`: compilação de produção.
- `npm test`: compila e executa os testes existentes.
- `npm run lint`: análise estática.
- `npm run db:generate`: gera migrações Drizzle após alterações no esquema.

## Cuidados para manutenção

1. Preservar a separação: Supabase para autenticação, D1 para registros e R2 para PDFs.
2. Toda API nova deve autenticar o usuário e filtrar registros por `userId`.
3. Toda mutação deve usar `rejectCrossSiteMutation()` ou proteção equivalente.
4. Não tornar o bucket de PDFs público.
5. Manter o PDF.js carregado dinamicamente para não aumentar o pacote inicial.
6. Validar em celular qualquer mudança no leitor ou na navegação lateral.
7. Executar build e auditoria de dependências antes de publicar.
8. Atualizar a seção "Última alteração" a cada entrega relevante.

## Última alteração

**Data:** 16 de agosto de 2026.

- O menu lateral deixou de usar botões desativados e passou a usar links reais para todas as áreas.
- Memória, Raciocínio e Conexões ganharam endereços identificáveis; Leituras continua abrindo a aplicação persistente.
- No celular, a área de toque dos ícones foi ampliada e o desenho interno não intercepta o toque.
- Foi adicionada uma faixa contextual que confirma visualmente a área selecionada.
- Este README substituiu a documentação genérica do starter e agora representa o funcionamento real do Outro Cérebro.
