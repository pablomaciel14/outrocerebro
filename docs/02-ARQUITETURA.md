# Arquitetura e Estrutura do Código

[← Áreas e fluxos](01-AREAS-E-FLUXOS.md) · [Próximo: dados e segurança →](03-DADOS-E-SEGURANCA.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Visão Geral da Arquitetura

O sistema é construído utilizando **Next.js com App Router** e empacotado para máxima performance e compatibilidade com servidores Node.js, Vercel e Cloudflare Workers.

```text
app/
 ├── layout.tsx                     # Layout raiz com fonte Inter e antialiased
 ├── page.tsx                       # Login raiz intacto -> redireciona para /dashboard
 ├── LoginForm.tsx                  # Componente cliente com validação segura
 ├── globals.css                    # Tokens de Tailwind CSS
 ├── api/
 │    └── auth/                     # Rotas seguras /api/auth/login e /api/auth/logout
 └── dashboard/
      ├── layout.tsx                # Shell com Sidebar, Bell e requirePersonalUser
      ├── page.tsx                  # Server Component de KPIs e Visão Geral
      ├── equipe/page.tsx           # Server Component de agregação Map-Reduce
      ├── prazos/page.tsx           # Controle de fatalidades e prazos
      ├── documentos/page.tsx       # Repositório de peças
      ├── financeiro/page.tsx       # Controle de honorários
      ├── configuracoes/page.tsx    # Parâmetros do sistema
      └── processos/
           ├── page.tsx             # Client Component com Server-Side Pagination
           └── [id]/page.tsx        # Dynamic Server Component + EditProcessModal

components/
 ├── Sidebar.tsx                    # Menu lateral com ícones strokeWidth 1.5 e usePathname
 ├── KpiCard.tsx                    # Cards de métricas reativos
 ├── RecentCases.tsx                # Tabela de movimentações recentes
 └── EditProcessModal.tsx           # Modal flutuante para mutação inline de dados

lib/
 └── supabase.ts                    # Cliente universal Supabase

middleware.ts                       # Interceptor Web API sem dependências legadas
```

---

## Padrões de Implementação

1. **Server Components por Padrão**: As páginas `/dashboard`, `/dashboard/processos/[id]` e `/dashboard/equipe` são renderizadas no backend, eliminando latência de rede no navegador e protegendo chaves de acesso.
2. **Client Components para Interatividade**: As páginas `/dashboard/processos` (busca, filtros e paginação) e `EditProcessModal` utilizam `"use client"` para resposta imediata à digitação do usuário.
3. **Web API Middleware**: O arquivo `middleware.ts` opera exclusivamente com a especificação universal `Request` e `Response.redirect()`, garantindo compatibilidade multiplataforma.

---

## Próxima Leitura

Consulte [Dados, autenticação e segurança](03-DADOS-E-SEGURANCA.md).
