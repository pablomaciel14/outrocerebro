# Visão geral e conceito

[← Índice](../README.md) · [Próximo: áreas e fluxos →](01-AREAS-E-FLUXOS.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Conceito

O **Outro Cérebro** é uma extensão digital da memória e do raciocínio de uma única pessoa. Ele reúne captura de ideias, desenvolvimento de pensamentos, relações entre assuntos, planejamento de compromissos e leitura ativa de documentos.

O produto parte de cinco princípios:

1. **Privacidade:** o conteúdo é pessoal e exige autenticação.
2. **Continuidade:** notas, agenda e leituras sobrevivem à troca de sessão e dispositivo.
3. **Baixo atrito:** registrar, retomar e editar deve exigir poucos toques.
4. **Conexão:** conhecimento não deve ficar isolado; páginas podem referenciar outras ideias.
5. **Leveza:** a interface deve parecer premium sem depender de uma camada visual pesada.

## O que o sistema é

- Um workspace pessoal de conhecimento.
- Um editor de páginas em Markdown simples.
- Uma agenda mensal para tarefas e compromissos.
- Uma biblioteca privada de PDFs com leitura ativa.
- Um sistema responsivo com temas claro e escuro.
- Instalável como PWA, aplicativo Desktop (Windows/Electron) e extensão Chrome — todos *thin clients* que carregam a mesma versão web, sem lógica própria.

## O que o sistema não é

- Não é um produto comercial.
- Não é uma rede social ou plataforma colaborativa.
- Não possui cadastro público ou múltiplos clientes.
- Não oferece cobrança, assinatura ou marketplace.
- Não substitui o Notion ou o Google Calendar; usa algumas ideias de interação adequadas ao objetivo pessoal.

## Usuário e acesso

O proprietário e único usuário autorizado é Pablo Maciel. O endereço público mostra somente a entrada; workspace, APIs e arquivos exigem a sessão pessoal válida.

## Visão funcional resumida

```text
Login privado
  └── Workspace
      ├── Memória      → capturar e guardar
      ├── Raciocínio   → desenvolver e decidir
      ├── Conexões     → relacionar assuntos
      ├── Agenda       → planejar tarefas e compromissos
      └── Leituras     → ler, destacar, anotar e retomar PDFs
```

## Estado de maturidade

| Capacidade | Estado |
| --- | --- |
| Login pessoal | Funcional |
| Páginas editáveis | Funcional e persistente |
| Templates de páginas | Funcional; cinco modelos estáticos e editáveis |
| Agenda | Funcional e persistente |
| Biblioteca e leitor de PDFs | Funcional e persistente |
| Destaques e notas de leitura | Funcional e persistente |
| Relações escritas com `[[...]]` | Aceitas no conteúdo |
| Backlinks e grafo automático entre páginas | Planejado; ainda não calculado automaticamente |
| OCR para PDF digitalizado | Planejado; ainda não implementado |
| Menu de perfil (tema, área padrão, sair) | Funcional e persistente por conta |
| PWA instalável | Funcional; sem cache/offline (só instalabilidade) |
| Aplicativo Desktop (Windows) | Funcional; publicação do instalador é manual, sem CI |
| Extensão Chrome | Funcional; publicação do `.zip` é manual, sem CI |
| Testes automatizados (CSRF, isolamento de dados, validação de PDF, bloqueio de login) | Funcional, cobertura comportamental real |
| Testes automatizados para Desktop/Extensão/PWA | Ainda não existem |

## Próxima leitura

Consulte [Áreas e fluxos funcionais](01-AREAS-E-FLUXOS.md) para entender cada parte da interface.
