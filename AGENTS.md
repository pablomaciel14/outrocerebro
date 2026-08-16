# Instruções para IAs e mantenedores — Outro Cérebro

Leia este arquivo antes de alterar o projeto. Ele é o ponto de entrada permanente para qualquer IA ou programador que abrir esta pasta.

## Identidade do produto

O **Outro Cérebro** é o sistema pessoal, privado e não comercial de organização de conhecimento de Pablo Maciel. Não é SaaS, não possui cadastro público, planos, vendas, múltiplos clientes nem colaboração entre usuários.

Site principal: <https://outrocerebro.com.br>

## Mapa obrigatório de leitura

1. [Visão geral e conceito](docs/00-VISAO-GERAL.md)
2. [Áreas e fluxos funcionais](docs/01-AREAS-E-FLUXOS.md)
3. [Arquitetura e estrutura do código](docs/02-ARQUITETURA.md)
4. [Dados, autenticação e segurança](docs/03-DADOS-E-SEGURANCA.md)
5. [Operação, manutenção e publicação](docs/04-OPERACAO-E-MANUTENCAO.md)
6. [Grafo navegável da documentação](docs/GRAFO-DA-DOCUMENTACAO.md)
7. [Histórico de alterações](docs/CHANGELOG.md)

## Regras que não podem ser quebradas

- Preservar o caráter pessoal e de usuário único.
- Nunca colocar senhas, tokens ou chaves secretas no código ou na documentação.
- Autenticar páginas privadas e todas as APIs de dados.
- Filtrar todo registro persistente por `userId`.
- Proteger mutações contra requisições entre sites com `rejectCrossSiteMutation()` ou proteção equivalente.
- Manter PDFs privados no R2; nunca expor o bucket publicamente.
- Usar D1 para dados estruturados e R2 para arquivos.
- Preservar a divisão atual: Supabase somente para autenticação; D1/R2 para dados do produto.
- Tratar a área de Leituras com cuidado especial: alterações no workspace geral não devem modificar o leitor sem pedido explícito.
- Atualizar [CHANGELOG.md](docs/CHANGELOG.md) e a seção “Estado atual” deste arquivo após cada entrega relevante.

## Estado atual

- Memória, Raciocínio e Conexões possuem páginas editáveis e persistentes.
- A criação de páginas oferece cinco templates editáveis e uma página em branco.
- Agenda possui calendário mensal, tarefas e compromissos persistentes.
- Leituras possui upload privado de PDF, Markdown extraído, progresso, cronômetro, marcadores e destaques.
- Temas claro e escuro funcionam em todo o sistema.
- A interface é responsiva para computador, tablet e celular.

## Última atualização funcional

Em **16 de agosto de 2026**, foi adicionada uma galeria responsiva com cinco templates editáveis: Planejamento semanal, Projeto pessoal, Notas de reunião, Rastreador de hábitos e Controle financeiro. Ao escolher um modelo, uma página persistente é criada e aberta imediatamente no editor com salvamento automático. A área de Leituras não foi alterada.

## Comandos essenciais

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
npm run db:generate
```

Antes de publicar: executar build, testes, revisão de segurança proporcional à alteração e conferir se migrações necessárias estão em `drizzle/`.
