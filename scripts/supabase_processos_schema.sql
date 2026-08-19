-- ==============================================================================
-- SCHEMA DA TABELA PROCESSOS (SUPABASE / POSTGRESQL)
-- Outro Cérebro - Gestão Estratégica & KPIs
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.processos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    valor_causa NUMERIC(15,2),
    status_resultado TEXT,
    formato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Índices de busca e agregação de performance para o Dashboard
CREATE INDEX IF NOT EXISTS idx_processos_responsavel ON public.processos(responsavel);
CREATE INDEX IF NOT EXISTS idx_processos_materia ON public.processos(materia);
CREATE INDEX IF NOT EXISTS idx_processos_status ON public.processos(status_resultado);
CREATE INDEX IF NOT EXISTS idx_processos_data_entrada ON public.processos(data_entrada DESC);

-- Habilitar RLS (opcional / recomendado)
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública/autenticada para o Dashboard
CREATE POLICY "Permitir leitura para consultas autenticadas/anon" 
ON public.processos 
FOR SELECT 
USING (true);
