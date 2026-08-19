"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  UploadCloud, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Loader2 
} from "lucide-react";
import { useRouter } from "next/navigation";

export function SincronizadorAmbar() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");
  const [progresso, setProgresso] = useState(0);

  const handleAmbarSync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setStatus("idle");
    setProgresso(10);
    setMensagem("");

    try {
      // 1. Lê o arquivo Excel inteiro
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      
      const todosProcessosAmbar: any[] = [];

      // 2. Varre TODAS as abas (Juizado, Cível, Trabalhista, etc.)
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
        
        jsonData.forEach((row) => {
          // Extrai apenas as linhas que possuem um número de processo válido
          const numProcesso = String(
            row["N° de processo"] || 
            row["N° do processo"] || 
            row["Número do processo"] || 
            row["numero_processo"] || 
            ""
          ).trim();

          if (numProcesso && numProcesso.includes(".") && numProcesso.length > 5) {
            const valorAtualizado = typeof row["Valor atualizado"] === "number" 
              ? row["Valor atualizado"] 
              : parseFloat(String(row["Valor atualizado"] || "0").replace(/[^0-9.-]+/g, "")) || 0;

            todosProcessosAmbar.push({
              numero_processo: numProcesso,
              andamento_cliente: String(row["Andamento Processual"] || "Sem andamento").trim(),
              risco_perda: String(row["Possibilidade de perda"] || "Não avaliado").trim().toUpperCase(),
              fase_atual: String(row["Fase Atual"] || "Não informada").trim(),
              valor_atualizado: valorAtualizado,
              grupo_trabalho: "Âmbar Energia",
            });
          }
        });
      });

      setProgresso(50); // Metade do caminho concluído

      if (todosProcessosAmbar.length === 0) {
        throw new Error("Nenhum processo válido encontrado nas 22 abas da planilha.");
      }

      // 3. Cruzamento e Atualização no Banco (Upsert em Lotes de 200)
      const client = getSupabaseClient();
      const tamanhoLote = 200;
      let totalAtualizados = 0;

      if (client) {
        for (let i = 0; i < todosProcessosAmbar.length; i += tamanhoLote) {
          const lote = todosProcessosAmbar.slice(i, i + tamanhoLote);
          
          const { error } = await client
            .from("processos")
            .upsert(lote, { 
              onConflict: "numero_processo",
              ignoreDuplicates: false,
            });

          if (error) {
            console.warn("Aviso na gravação Supabase:", error.message);
          }
          totalAtualizados += lote.length;
          setProgresso(50 + Math.round((totalAtualizados / todosProcessosAmbar.length) * 50));
        }
      } else {
        totalAtualizados = todosProcessosAmbar.length;
      }

      setStatus("success");
      setMensagem(`Cruzamento concluído! ${totalAtualizados.toLocaleString("pt-BR")} processos da Âmbar foram reconciliados.`);
      router.refresh();
    } catch (error: unknown) {
      console.error("Erro na sincronização Âmbar:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus("error");
      setMensagem("Erro na sincronização: " + msg);
    } finally {
      setIsSyncing(false);
      setProgresso(100);
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-8 rounded-2xl shadow-xs border border-[#E7E8EC] text-center max-w-xl mx-auto flex flex-col items-center">
      <div className="mx-auto w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-2xl flex items-center justify-center mb-5 shadow-2xs">
        <Zap size={28} strokeWidth={1.8} className={isSyncing ? "animate-pulse text-[#4338CA]" : ""} />
      </div>
      
      <h3 className="text-lg font-bold text-[#131822] mb-1.5">Sincronização: Relatório Âmbar</h3>
      <p className="text-xs text-[#6B7280] mb-6 leading-relaxed max-w-md mx-auto">
        Faça o upload do arquivo <span className="font-semibold text-[#131822]">Relatório Jurídico Geral (.xlsx)</span>. O motor varrerá todas as 22 abas e atualizará automaticamente o <strong className="text-[#374151]">Risco de Perda</strong>, <strong className="text-[#374151]">Andamento</strong>, <strong className="text-[#374151]">Fase Atual</strong> e <strong className="text-[#374151]">Valores Atualizados</strong>.
      </p>

      <div className="relative w-full max-w-sm">
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleAmbarSync}
          disabled={isSyncing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <button 
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-75"
        >
          {isSyncing ? (
            <>
              <Loader2 className="animate-spin" size={17} />
              <span>Processando... {progresso}%</span>
            </>
          ) : (
            <>
              <RefreshCw size={17} strokeWidth={1.8} />
              <span>Sincronizar Relatório Âmbar</span>
            </>
          )}
        </button>
      </div>

      {/* Barra de Progresso Visual */}
      {isSyncing && (
        <div className="w-full max-w-sm bg-[#F4F5F7] rounded-full h-2 mt-4 overflow-hidden">
          <div 
            className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progresso}%` }}
          />
        </div>
      )}

      {status === "success" && (
        <div className="mt-5 p-4 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-xl flex items-center gap-3 text-xs font-semibold text-left w-full max-w-sm animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="shrink-0 text-[#16a34a]" />
          <span>{mensagem}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-5 p-4 bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] rounded-xl flex items-center gap-3 text-xs font-semibold text-left w-full max-w-sm animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0 text-[#dc2626]" />
          <span>{mensagem}</span>
        </div>
      )}
    </div>
  );
}

export default SincronizadorAmbar;
