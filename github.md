repo: pablomaciel14/outrocerebro
branch: main

## Last sync
date: 2026-08-19T13:05:18Z

### Updated in this project
- Recriadas as telas do dashboard (Visão Geral, Processos, Prazos, Documentos, Honorários, Equipe, Configurações) e a tela de login.
- Logos e favicon copiados de `public/`.
- Redesign do painel (Painel v2) com telas novas: detalhe do processo, cadastro, clientes, relatórios e versão mobile.

## Screen map
| Tela (Outro Cerebro.dc.html) | Arquivos de origem |
| --- | --- |
| Login | app/page.tsx, app/LoginForm.tsx, app/ThemeToggle.tsx, app/globals.css |
| Shell do painel (sidebar + header) | app/dashboard/layout.tsx, components/Sidebar.tsx |
| Visão Geral | app/dashboard/page.tsx, components/KpiCard.tsx, components/RecentCases.tsx |
| Processos | app/dashboard/processos/page.tsx |
| Agenda & Prazos | app/dashboard/prazos/page.tsx |
| Documentos | app/dashboard/documentos/page.tsx |
| Honorários | app/dashboard/financeiro/page.tsx |
| Equipe & Clientes | app/dashboard/equipe/page.tsx |
| Configurações | app/dashboard/configuracoes/page.tsx |
| Painel v2 — detalhe do processo | app/dashboard/processos/[id]/page.tsx, components/EditProcessModal.tsx |
| Painel v2 — cadastro de processo | components/EditProcessModal.tsx, app/dashboard/processos/[id]/page.tsx, db/schema.ts |
| Painel v2 — prazos, clientes, relatórios, mobile | app/dashboard/prazos/page.tsx, app/dashboard/equipe/page.tsx, app/dashboard/page.tsx |
