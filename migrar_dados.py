#!/usr/bin/env python3
"""
Script de Migração e Carga de Dados (Planilha Excel -> Supabase)
Outro Cérebro - Módulo de Gestão Estratégica & KPIs
"""

import os
import sys
import math
import numpy as np
import pandas as pd
from pathlib import Path

try:
    from supabase import create_client, Client
except ImportError:
    print("Erro: biblioteca 'supabase' não instalada. Execute: pip install supabase")
    sys.exit(1)


def carregar_env():
    """Tenta carregar variáveis de ambiente de .env.local ou .env se existirem."""
    env_files = [Path(".env.local"), Path(".env"), Path("../.env.local")]
    for env_file in env_files:
        if env_file.exists():
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("\"'")
                        if k not in os.environ:
                            os.environ[k] = v


def main():
    carregar_env()

    # 1. Configuração de Credenciais
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_KEY")
        or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        or os.environ.get("SUPABASE_PUBLISHABLE_KEY")
    )

    if not supabase_url or not supabase_key:
        print("Aviso: Credenciais do Supabase não encontradas no ambiente.")
        supabase_url = input("Digite a SUPABASE_URL: ").strip()
        supabase_key = input("Digite a SUPABASE_SERVICE_ROLE_KEY (ou chave anon): ").strip()

    supabase: Client = create_client(supabase_url, supabase_key)

    # 2. Localização do Arquivo Excel
    possiveis_caminhos = [
        Path("Auditoria de cadastro de Processos.xlsx"),
        Path("Auditoria de Cadastro de Processos.xlsx"),
        Path("../Auditoria de cadastro de Processos.xlsx"),
        Path("C:/Users/Cliente/OneDrive/Desktop/Auditoria de cadastro de Processos.xlsx"),
        Path("C:/Users/Cliente/Desktop/Auditoria de cadastro de Processos.xlsx"),
    ]

    file_path = None
    if len(sys.argv) > 1:
        file_path = Path(sys.argv[1])
    else:
        for p in possiveis_caminhos:
            if p.exists():
                file_path = p
                break

    if not file_path or not file_path.exists():
        print("Arquivo da planilha não encontrado automaticamente.")
        caminho_input = input("Informe o caminho para o arquivo .xlsx: ").strip()
        file_path = Path(caminho_input)

    if not file_path.exists():
        print(f"Erro: Arquivo '{file_path}' não foi encontrado.")
        sys.exit(1)

    print(f"Lendo o arquivo Excel: {file_path}...")
    try:
        # Tenta ler com a aba 'CPJ-3C', se falhar lê a primeira aba
        try:
            df = pd.read_excel(file_path, sheet_name="CPJ-3C")
        except Exception:
            df = pd.read_excel(file_path)
    except Exception as e:
        print(f"Erro ao ler a planilha: {e}")
        sys.exit(1)

    print(f"Total de linhas lidas na planilha: {len(df)}")

    # 3. Mapeamento e Normalização de Colunas
    df_mapped = pd.DataFrame()

    def normalizar_data(coluna):
        if coluna not in df.columns:
            return None
        return pd.to_datetime(df[coluna], errors="coerce").dt.strftime("%Y-%m-%d")

    def normalizar_texto(coluna):
        if coluna not in df.columns:
            return None
        return df[coluna].astype(str).replace({"nan": None, "None": None, "": None})

    df_mapped["data_entrada"] = normalizar_data("Data de entrada")
    df_mapped["pj_protocolo"] = normalizar_texto("PJ - Protocolo Jurídico")
    df_mapped["materia"] = normalizar_texto("Matéria")
    df_mapped["tema"] = normalizar_texto("Tema")
    df_mapped["grupo_trabalho"] = normalizar_texto("Grupo de Trabalho")
    df_mapped["responsavel"] = normalizar_texto("Responsável")
    df_mapped["acao"] = normalizar_texto("Ação")
    df_mapped["numero_processo"] = normalizar_texto("Número do processo")
    df_mapped["juizo"] = normalizar_texto("Juízo")
    df_mapped["autor"] = normalizar_texto("Autor")
    df_mapped["reu"] = normalizar_texto("Réu")
    df_mapped["advogado"] = normalizar_texto("Advogado")
    df_mapped["data_ajuizamento"] = normalizar_data("Data Ajuizamento")
    
    if "Valor da causa" in df.columns:
        df_mapped["valor_causa"] = pd.to_numeric(df["Valor da causa"], errors="coerce").fillna(0)
    else:
        df_mapped["valor_causa"] = 0.0

    df_mapped["status_resultado"] = normalizar_texto("Resultado")
    df_mapped["formato"] = normalizar_texto("Físico/Eletrônico")

    # Remover linhas sem número do processo
    df_mapped = df_mapped.dropna(subset=["numero_processo"])
    
    # Remover duplicatas de número de processo mantendo o primeiro registro
    df_mapped = df_mapped.drop_duplicates(subset=["numero_processo"], keep="first")

    # Substituir valores NaN/None por tipos aceitos pelo JSON
    df_mapped = df_mapped.replace({np.nan: None})

    registros = df_mapped.to_dict(orient="records")
    print(f"Registros válidos e prontos para inserção: {len(registros)}")

    # 4. Inserção em Lote (Upsert para evitar conflito de duplicidade)
    tamanho_lote = 250
    total_inserido = 0

    print("Iniciando envio dos dados para a tabela 'processos' no Supabase...")

    for i in range(0, len(registros), tamanho_lote):
        lote = registros[i : i + tamanho_lote]
        try:
            # Usando upsert com base no numero_processo (on_conflict='numero_processo')
            response = supabase.table("processos").upsert(
                lote, on_conflict="numero_processo"
            ).execute()
            total_inserido += len(lote)
            print(f"Progresso: {total_inserido}/{len(registros)} registros sincronizados...")
        except Exception as e:
            print(f"Erro ao sincronizar lote [{i}:{i+tamanho_lote}]: {e}")

    print("\n✅ Migração finalizada!")
    print(f"Total de processos sincronizados com sucesso: {total_inserido}")


if __name__ == "__main__":
    main()
