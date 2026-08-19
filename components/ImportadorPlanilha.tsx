"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Database,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export function ImportadorPlanilha() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [progresso, setProgresso] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus("idle");
    setProgresso("Lendo planilha...");
    setMensagem("");

    try {
      // 1. Ler o arquivo Excel no navegador
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("A planilha selecionada está vazia.");
      }

      // 2. Mapear as colunas da planilha para o modelo relacional
      const registros = jsonData
        .map((row) => {
          const numProcesso = String(
            row["Número do processo"] || 
            row["Numero do processo"] || 
            row["numero_processo"] || 
            row["Nº Processo"] || 
            ""
          ).trim();

          const valorCausa = typeof row["Valor da causa"] === "number" 
            ? row["Valor da causa"] 
            : parseFloat(String(row["Valor da causa"] || "0").replace(/[^0-9.-]+/g, "")) || 0;

          return {
            pj_protocolo: String(row["PJ - Protocolo Jurídico"] || row["pj_protocolo"] || "").trim(),
            materia: String(row["Matéria"] || row["Materia"] || row["materia"] || "Cível").trim(),
            tema: String(row["Tema"] || row["tema"] || "").trim(),
            grupo_trabalho: String(row["Grupo de Trabalho"] || row["grupo_trabalho"] || "").trim(),
            responsavel: String(row["Responsável"] || row["Responsavel"] || row["responsavel"] || "").trim(),
            acao: String(row["Ação"] || row["Acao"] || row["acao"] || "").trim(),
            numero_processo: numProcesso,
            juizo: String(row["Juízo"] || row["Juizo"] || row["juizo"] || "").trim(),
            autor: String(row["Autor"] || row["autor"] || "").trim(),
            reu: String(row["Réu"] || row["Reu"] || row["reu"] || "").trim(),
            advogado: String(row["Advogado"] || row["advogado"] || "").trim(),
            valor_causa: valorCausa,
            status_resultado: String(row["Resultado"] || row["Status"] || row["status_resultado"] || "Em andamento").trim(),
            formato: String(row["Físico/Eletrônico"] || row["formato"] || "Eletrônico").trim(),
          };
        })
        .filter((r) => r.numero_processo && r.numero_processo.length > 3);

      if (registros.length === 0) {
        throw new Error("Nenhum processo válido encontrado na planilha. Verifique a coluna 'Número do processo'.");
      }

      setProgresso(`Processando ${registros.length.toLocaleString("pt-BR")} registros...`);

      // 3. Enviar em lotes (Upsert de 250 em 250 registros) para o Supabase
      const client = getSupabaseClient();
      if (client) {
        const BATCH_SIZE = 250;
        let processados = 0;

        for (let i = 0; i < registros.length; i += BATCH_SIZE) {
          const lote = registros.slice(i, i + BATCH_SIZE);
          setProgresso(`Sincronizando ${i + 1} a ${Math.min(i + BATCH_SIZE, registros.length)} de ${registros.length}...`);

          const { error } = await client
            .from("processos")
            .upsert(lote, { onConflict: "numero_processo" });

          if (error) {
            console.warn("Aviso na gravação Supabase:", error.message);
          }
          processados += lote.length;
        }
      }

      setStatus("success");
      setMensagem(`${registros.length.toLocaleString("pt-BR")} processos sincronizados com sucesso via Upsert!`);
      router.refresh();
    } catch (error: unknown) {
      console.error("Erro na importação:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus("error");
      setMensagem("Erro ao processar planilha: " + msg);
    } finally {
      setIsUploading(false);
      setProgresso("");
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-xs border border-[#E7E8EC] text-center max-w-xl mx-auto">
      <div className="mx-auto w-16 h-16 bg-[#DBEAFE] text-[#2563EB] rounded-2xl flex items-center justify-center mb-5 shadow-2xs">
        <UploadCloud size={30} strokeWidth={1.8} />
      </div>
      
      <h3 className="text-lg font-bold text-[#131822] mb-1.5">Importar & Atualizar Acervo</h3>
      <p className="text-xs text-[#6B7280] mb-6 leading-relaxed max-w-md mx-auto">
        Arraste ou selecione o arquivo <span className="font-semibold text-[#131822]">Auditoria de cadastro de Processos.xlsx</span> para atualizar o banco de dados. Processos existentes serão atualizados (Upsert) e novos serão cadastrados automaticamente.
      </p>

      <div className="relative">
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <div 
          className={`w-full flex items-center justify-center gap-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isUploading ? "opacity-75 cursor-wait" : "cursor-pointer"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" size={17} />
              <span>{progresso || "Processando dados..."}</span>
            </>
          ) : (
            <>
              <FileSpreadsheet size={17} strokeWidth={1.8} />
              <span>Selecionar Planilha Excel (.xlsx)</span>
            </>
          )}
        </div>
      </div>

      {status === "success" && (
        <div className="mt-5 p-4 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-xl flex items-center gap-3 text-xs font-semibold text-left animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-[#16a34a]" />
          <span>{mensagem}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 p-4 bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] rounded-xl flex items-center gap-3 text-xs font-semibold text-left animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0 text-[#dc2626]" />
          <span>{mensagem}</span>
        </div>
      )}
    </div>
  );
}

export default ImportadorPlanilha;
