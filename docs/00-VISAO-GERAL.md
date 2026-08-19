# Visão Geral e Conceito

[← Índice](../README.md) · [Próximo: áreas e fluxos →](01-AREAS-E-FLUXOS.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Conceito

O **Outro Cérebro** é o sistema proprietário, privado e de alta performance para **Gestão Jurídica, Acervo Processual & Dashboard Estratégico** de Pablo Maciel. Ele reúne inteligência contenciosa, monitoramento de prazos, repositório de peças e distribuição balanceada de carga operacional.

O sistema é construído sobre quatro pilares:

1. **Claridade Estrutural (Foco & TDAH-Friendly):** Eliminação de ruídos e alta vibração visual. Uso de tons off-white quentes (`#FAFAFA`), tipografia geométrica **Inter** (`antialiased`) e ícones de linha fina (`strokeWidth={1.5}`) para leitura fluida e redução da fadiga cognitiva.
2. **Alta Performance com Server-Side Rendering (SSR):** Processamento de grandes volumes processuais (3.927+ processos) diretamente no servidor através de *Server Components*, *Server-Side Pagination* (50 registros/página) e agregação *Map-Reduce*.
3. **Privacidade e Isolamento:** Autenticação robusta (Supabase + HMAC SHA-256) protegida na borda por Web Middleware, com dados protegidos contra acessos não autorizados.
4. **Agilidade Operacional:** Acesso instantâneo à ficha detalhada de qualquer processo, com edição rápida de status e valores da causa através de modais interativos em tempo real.

---

## O que o sistema é

- Um painel de KPIs e inteligência jurídica sobre o acervo contencioso.
- Um data grid de processos com paginação no servidor e filtros por matéria/status.
- Uma central de detalhes processuais com partes, classificação, finanças e edição inline.
- Um módulo de distribuição e balanceamento de carga da equipe de advogados.
- Um repositório de agenda, prazos, documentos e controle financeiro de honorários.

---

## O que o sistema não é

- Não é um SaaS comercial aberto ao público.
- Não possui cadastro público ou cobrança de assinaturas.
- Não expõe chaves de banco de dados no cliente.

---

## Visão Funcional Resumida

```text
Login Privado (/)
  └── Dashboard (/dashboard)
      ├── Visão Geral          → KPIs (3.927 processos), matérias e movimentações
      ├── Acervo de Processos  → Busca, filtros e paginação no servidor
      │   └── Ficha [id]       → Detalhes completos e modal de edição rápida
      ├── Equipe & Clientes    → Distribuição de carga por advogado (Map-Reduce)
      ├── Agenda & Prazos      → Controle de publicações e fatalidades
      ├── Documentos           → Repositório de peças e modelos
      ├── Honorários           → Controle de honorários e faturamento
      └── Configurações        → Parâmetros, conexões e segurança
```

---

## Estado de Maturidade

| Capacidade | Estado |
| :--- | :--- |
| Login pessoal seguro | Funcional (Supabase + Sessão HMAC SHA-256) |
| Dashboard de KPIs | Funcional com auditoria de 3.927 processos |
| Data Grid com Paginação no Servidor | Funcional (50 processos por página, busca e filtros) |
| Ficha do Processo & Modal de Edição | Funcional com mutação direta e `router.refresh()` |
| Distribuição de Carga da Equipe | Funcional (Map-Reduce no servidor e barras em dupla camada) |
| Web Middleware de Proteção | Funcional sem dependências de edge legadas |
| Design Claridade Estrutural | Funcional (Inter, strokeWidth 1.5, paleta calma TDAH) |
| Suíte de Testes Automatizados | 37/37 testes comportamentais aprovados |

---

## Próxima Leitura

Consulte [Áreas e fluxos funcionais](01-AREAS-E-FLUXOS.md) para entender cada módulo em detalhes.
