# Outro Cérebro

Sistema pessoal, privado e não comercial de organização de conhecimento de Pablo Maciel.

> **IA ou programador chegando ao projeto:** comece por [AGENTS.md](AGENTS.md). Ele contém o contexto obrigatório, as regras de segurança e a ordem recomendada de leitura.

## O que o sistema reúne

- páginas editáveis nas áreas Memória, Raciocínio e Conexões;
- cinco templates editáveis inspirados em usos populares do Notion;
- agenda mensal com tarefas e compromissos;
- biblioteca privada de PDFs;
- leitura com Markdown, progresso, cronômetro, marcadores, destaques e notas;
- temas claro e escuro em computador, tablet e celular.

Site: <https://outrocerebro.com.br>

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [AGENTS.md](AGENTS.md) | entrada obrigatória para IAs e regras do projeto |
| [Visão geral](docs/00-VISAO-GERAL.md) | conceito, princípios, escopo e maturidade |
| [Áreas e fluxos](docs/01-AREAS-E-FLUXOS.md) | todas as áreas e funcionalidades |
| [Arquitetura](docs/02-ARQUITETURA.md) | estrutura, rotas, APIs e fluxos técnicos |
| [Dados e segurança](docs/03-DADOS-E-SEGURANCA.md) | persistência, autenticação e proteções |
| [Operação e manutenção](docs/04-OPERACAO-E-MANUTENCAO.md) | desenvolvimento, cuidados e publicação |
| [Grafo da documentação](docs/GRAFO-DA-DOCUMENTACAO.md) | mapa visual com links entre todos os assuntos |
| [Changelog](docs/CHANGELOG.md) | última atualização e histórico consolidado |

## Grafo resumido

```mermaid
flowchart LR
    OC["Outro Cérebro"] --> C["Conceito"]
    OC --> A["Áreas"]
    OC --> T["Arquitetura"]
    OC --> H["Histórico"]
    A --> M["Memória"]
    A --> R["Raciocínio"]
    A --> X["Conexões"]
    A --> G["Agenda"]
    A --> L["Leituras"]
    T --> D["D1"]
    T --> B["R2"]
    T --> S["Supabase Auth"]

    click C "./docs/00-VISAO-GERAL.md" "Abrir conceito"
    click A "./docs/01-AREAS-E-FLUXOS.md" "Abrir áreas"
    click T "./docs/02-ARQUITETURA.md" "Abrir arquitetura"
    click H "./docs/CHANGELOG.md" "Abrir histórico"
```

O [grafo completo e navegável](docs/GRAFO-DA-DOCUMENTACAO.md) relaciona todas as áreas, serviços e documentos.

## Última atualização

Em **16 de agosto de 2026**, foi adicionada a galeria com cinco templates editáveis. A página escolhida é criada de forma persistente e aberta imediatamente para edição. Consulte o [histórico completo](docs/CHANGELOG.md).

## Comandos rápidos

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
```
