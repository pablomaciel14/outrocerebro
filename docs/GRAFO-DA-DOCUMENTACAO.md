# Grafo navegável da documentação

[← Índice principal](../README.md) · [Instruções para IAs](../AGENTS.md)

Este grafo mostra como conceito, funções e implementação se relacionam. Os nós possuem links clicáveis em renderizadores Mermaid compatíveis; a lista abaixo garante navegação em qualquer leitor Markdown.

```mermaid
flowchart TD
    ROOT["Outro Cérebro"]
    AI["Entrada para IAs"]
    CONCEPT["Conceito e visão geral"]
    AREAS["Áreas e fluxos"]
    ARCH["Arquitetura"]
    DATA["Dados e segurança"]
    OPS["Operação e manutenção"]
    LOG["Histórico de alterações"]

    MEM["Memória"]
    REASON["Raciocínio"]
    LINKS["Conexões"]
    CAL["Agenda"]
    READ["Leituras"]
    TPL["Templates"]

    AUTH["Supabase Auth"]
    D1["D1 / SQLite"]
    R2["R2 privado"]
    UI["React + Vinext"]

    ROOT --> AI
    ROOT --> CONCEPT
    CONCEPT --> AREAS
    AREAS --> MEM
    AREAS --> REASON
    AREAS --> LINKS
    AREAS --> CAL
    AREAS --> READ
    MEM --> TPL
    REASON --> TPL
    LINKS --> TPL
    ROOT --> ARCH
    ARCH --> UI
    ARCH --> DATA
    DATA --> AUTH
    DATA --> D1
    DATA --> R2
    ARCH --> OPS
    OPS --> LOG

    click AI "../AGENTS.md" "Abrir instruções para IAs"
    click CONCEPT "./00-VISAO-GERAL.md" "Abrir visão geral"
    click AREAS "./01-AREAS-E-FLUXOS.md" "Abrir áreas e fluxos"
    click MEM "./01-AREAS-E-FLUXOS.md#memória" "Abrir Memória"
    click REASON "./01-AREAS-E-FLUXOS.md#raciocínio" "Abrir Raciocínio"
    click LINKS "./01-AREAS-E-FLUXOS.md#conexões" "Abrir Conexões"
    click CAL "./01-AREAS-E-FLUXOS.md#agenda" "Abrir Agenda"
    click READ "./01-AREAS-E-FLUXOS.md#leituras" "Abrir Leituras"
    click TPL "./01-AREAS-E-FLUXOS.md#templates" "Abrir Templates"
    click ARCH "./02-ARQUITETURA.md" "Abrir arquitetura"
    click DATA "./03-DADOS-E-SEGURANCA.md" "Abrir dados e segurança"
    click OPS "./04-OPERACAO-E-MANUTENCAO.md" "Abrir operação"
    click LOG "./CHANGELOG.md" "Abrir histórico"
```

## Links diretos

- [Entrada para IAs e regras obrigatórias](../AGENTS.md)
- [Conceito, princípios e estado de maturidade](00-VISAO-GERAL.md)
- [Memória, Raciocínio, Conexões, Templates, Agenda e Leituras](01-AREAS-E-FLUXOS.md)
- [Componentes, rotas, APIs e fluxos técnicos](02-ARQUITETURA.md)
- [Banco, arquivos, autenticação e segurança](03-DADOS-E-SEGURANCA.md)
- [Desenvolvimento, manutenção e publicação](04-OPERACAO-E-MANUTENCAO.md)
- [Última atualização e histórico](CHANGELOG.md)
