# Dados, Autenticação e Segurança

[← Arquitetura](02-ARQUITETURA.md) · [Próximo: operação e manutenção →](04-OPERACAO-E-MANUTENCAO.md) · [Ver grafo](GRAFO-DA-DOCUMENTACAO.md)

## Camada de Dados (PostgreSQL / Supabase)

O acervo contencioso é armazenado na tabela relacional `processos`:

```sql
CREATE TABLE processos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data_entrada DATE,
    pj_protocolo TEXT,
    materia TEXT,
    tema TEXT,
    grupo_trabalho TEXT,
    responsavel TEXT,
    acao TEXT,
    numero_processo TEXT UNIQUE,
    juizo TEXT,
    autor TEXT,
    reu TEXT,
    advogado TEXT,
    data_ajuizamento DATE,
    valor_causa NUMERIC(15, 2),
    status_resultado TEXT,
    formato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_processos_numero ON processos(numero_processo);
CREATE INDEX idx_processos_materia ON processos(materia);
CREATE INDEX idx_processos_responsavel ON processos(responsavel);
CREATE INDEX idx_processos_status ON processos(status_resultado);
```

---

## Autenticação e Segurança

1. **Camada Dupla de Autenticação**:
   - Validação de sessão do usuário proprietário com HMAC SHA-256 via cookie `__Host-oc_session` (`app/personal-auth.ts`).
   - Sessão segura do Supabase Auth para controle de acesso às tabelas.
2. **Proteção contra Brute Force**:
   - `app/login-throttle.ts` bloqueia tentativas sucessivas de login com tempo de espera progressivo.
3. **Proteção contra CSRF**:
   - `app/security.ts` com `rejectCrossSiteMutation()` valida os cabeçalhos `Origin` e `Sec-Fetch-Site`.
4. **Fallback Resiliente**:
   - Caso o banco de dados remoto esteja temporariamente inacessível, o sistema recorre aos dados consolidados da auditoria de 3.927 processos sem quebrar a renderização.

---

## Próxima Leitura

Consulte [Operação, manutenção e publicação](04-OPERACAO-E-MANUTENCAO.md).
