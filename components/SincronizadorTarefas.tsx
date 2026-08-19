"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { getSupabaseClient } from "@/lib/supabase";
import { UploadCloud, CheckSquare, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SincronizadorTarefas() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [mensagem, setMensagem] = useState("");

  const handleTarefasSync = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    setStatus("idle");
    setMensagem("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("A planilha de tarefas está vazia.");
      }

      // Descobre se a planilha é de tarefas concluídas
      const isConcluida = "Cumprido em" in jsonData[0] || "Data Conclusão" in jsonData[0];
      const statusPadrao = isConcluida ? "Concluídas" : "Pendentes";

      const parseData = (val: any) => {
        if (!val) return null;
        try {
          const d = new Date(val);
          return !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : null;
        } catch {
          return null;
        }
      };

      const registros = jsonData
        .map((row) => {
          const numProcesso = String(
            row["Número do processo"] || 
            row["Numero do processo"] || 
            row["numero_processo"] || 
            row["Nº Processo"] || 
            ""
          ).trim();

          const evento = String(row["Evento"] || row["evento"] || row["Atividade"] || "").trim();
          const dataFatal = parseData(row["Data do Fatal"] || row["Data Fatal"] || row["data_fatal"] || row["Fatal"]);

          return {
            pj_protocolo: String(row["PJ"] || row["PJ - Protocolo"] || row["pj_protocolo"] || "").trim(),
            numero_processo: numProcesso,
            evento: evento,
            evento_principal: String(row["Evento Principal"] || row["evento_principal"] || "").trim(),
            data_fatal: dataFatal,
            data_agenda: parseData(row["Data Agenda"] || row["data_agenda"] || row["Data de Agenda"]),
            atribuido_para: String(row["Atribuído para"] || row["Responsável"] || row["atribuido_para"] || "").trim(),
            sigla_tramitacao: String(row["TRA.EVE.Sigla"] || row["sigla_tramitacao"] || "").trim(),
            status: statusPadrao,
            data_conclusao: parseData(row["Cumprido em"] || row["data_conclusao"] || row["Data Cumprimento"]),
          };
        })
        .filter((r) => r.numero_processo && r.evento && r.data_fatal);

      if (registros.length === 0) {
        throw new Error("Nenhuma tarefa válida encontrada com número de processo, evento e data fatal.");
      }

      // Envia os dados em lotes (Upsert)
      const client = getSupabaseClient();
      if (client) {
        const BATCH_SIZE = 250;
        for (let i = 0; i < registros.length; i += BATCH_SIZE) {
          const lote = registros.slice(i, i + BATCH_SIZE);
          const { error } = await client
            .from("tarefas")
            .upsert(lote, { onConflict: "numero_processo,evento,data_fatal" });

          if (error) {
            console.warn("Aviso gravação tarefas:", error.message);
          }
        }
      }

      setStatus("success");
      setMensagem(`${registros.length.toLocaleString("pt-BR")} tarefas (${statusPadrao}) sincronizadas com sucesso!`);
      router.refresh();
    } catch (error: unknown) {
      console.error("Erro na sincronização de tarefas:", error);
      const msg = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus("error");
      setMensagem("Erro na sincronização: " + msg);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-xs border border-[#E7E8EC] flex flex-col items-center text-center h-full">
      <div className="w-12 h-12 bg-[#DCFCE7] text-[#166534] rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
        <CheckSquare size={22} strokeWidth={1.8} />
      </div>
      
      <h3 className="text-base font-bold text-[#131822] mb-1">Pauta de Tarefas & Prazos</h3>
      <p className="text-xs text-[#6B7280] mb-6 leading-relaxed">
        Importe planilhas de <strong className="text-[#374151]">Atividades Pendentes</strong> ou <strong className="text-[#374151]">Concluídas</strong>. O sistema organizará o workflow e a agenda da equipe automaticamente.
      </p>

      <div className="relative w-full max-w-xs mt-auto">
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleTarefasSync}
          disabled={isSyncing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
        />
        <button 
          disabled={isSyncing}
          className="w-full flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-75"
        >
          {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
          <span>{isSyncing ? "Processando..." : "Sincronizar Tarefas"}</span>
        </button>
      </div>

      {status === "success" && (
        <div className="mt-4 p-3 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] rounded-xl flex items-center gap-2.5 text-xs font-semibold text-left w-full animate-in fade-in duration-200">
          <CheckCircle2 size={16} className="shrink-0 text-[#16A34A]" />
          <span>{mensagem}</span>
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-3 bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] rounded-xl flex items-center gap-2.5 text-xs font-semibold text-left w-full animate-in fade-in duration-200">
          <AlertCircle size={16} className="shrink-0 text-[#DC2626]" />
          <span>{mensagem}</span>
        </div>
      )}
    </div>
  );
}

export default SincronizadorTarefas;
