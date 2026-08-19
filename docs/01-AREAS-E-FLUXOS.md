# Áreas e Fluxos Funcionais

[← Visão geral](00-VISAO-GERAL.md) · [Próximo: arquitetura →](02-ARQUITETURA.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Módulos do Sistema

O **Outro Cérebro** organiza a operação jurídica em 7 módulos principais acessíveis pela barra lateral unificada:

---

### 1. Painel Geral & Visão Estratégica (`/dashboard`)
- **Resumo de KPIs**: Cartões de destaque com o Acervo Total (3.927 processos), Ações Ativas em Andamento (3.322), Matéria Predominante (Cível com 3.552 ações / 90,4%) e Segmentos Prioritários (Particulares & Âmbar Energia).
- **Tabela de Movimentações Recentes**: Lista os últimos casos atualizados com link direto para o acervo.
- **Carga por Advogado (Top 4)**: Gráfico de barras horizontais indicando a distribuição das principais carteiras.

---

### 2. Acervo de Processos (`/dashboard/processos`)
- **Server-Side Pagination**: Carregamento otimizado de 50 processos por página utilizando `.range(from, to)` com `{ count: 'exact' }`.
- **Busca Inteligente**: Campo de pesquisa por número de processo, autor ou réu.
- **Filtros por Matéria & Status**: Segmentação rápida por Cível, Eleitoral, Trabalhista, Administrativo, Em andamento ou Sentença favorável.
- **Navegação Interativa**: Clique em qualquer linha da tabela para abrir a ficha completa do processo.

---

### 3. Ficha do Processo & Edição (`/dashboard/processos/[id]`)
- **Identificação Completa**: Número do processo, ação, autor (polo ativo) e réu (polo passivo).
- **Classificação Jurídica**: Matéria, tema específico e juízo / foro competente.
- **Gestão Interna**: Advogado responsável, grupo de trabalho e linha do tempo (data de entrada e ajuizamento).
- **Informações Financeiras**: Destaque para o valor da causa formatado em moeda brasileira (`R$`).
- **Modal de Edição Rápida (`EditProcessModal`)**: Modal flutuante para atualizar o status e o valor da causa com sincronização imediata no banco de dados e atualização de tela sem reload completo.

---

### 4. Equipe & Distribuição de Carga (`/dashboard/equipe`)
- **Agregação no Servidor (Map-Reduce)**: O backend computa os volumes totais e ativos de cada advogado em tempo de execução.
- **Ranqueamento Automático**: O advogado com maior carteira assume o topo como referência de 100% da escala visual.
- **Barras de Progresso em Dupla Camada**:
  - Barra azul clara: volume relativo do advogado em relação ao líder.
  - Barra azul escura interna: proporção de processos efetivamente em andamento.

---

### 5. Agenda & Prazos (`/dashboard/prazos`)
- Monitoramento de prazos fatais, publicações e intimações.
- Badges de urgência: Urgentes (&le; 3 dias em vermelho), Esta Semana (amarelo) e Próximos 15 dias (verde).

---

### 6. Documentos (`/dashboard/documentos`)
- Repositório de peças processuais, modelos contratuais, procurações e documentos probatórios.

---

### 7. Honorários & Finanças (`/dashboard/financeiro`)
- Monitoramento de honorários contratuais previstos, sucumbências em execução e faturamento consolidado do mês.

---

## Próxima Leitura

Consulte [Arquitetura e estrutura do código](02-ARQUITETURA.md) para compreender a camada técnica.
