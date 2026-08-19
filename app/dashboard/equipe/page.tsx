import React from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Users, Briefcase, BarChart3, ShieldCheck, Database, Award } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProcessoMinimo {
  responsavel?: string;
  status_resultado?: string;
}

// Base consolidada da auditoria para fallback garantido
const DADOS_AUDITORIA_EQUIPE: { nome: string; total: number; ativos: number }[] = [
  { nome: "Pablo Maciel", total: 1758, ativos: 1487 },
  { nome: "Thiago Pires", total: 992, ativos: 840 },
  { nome: "Lucas Pires", total: 417, ativos: 352 },
  { nome: "João Vitor", total: 377, ativos: 319 },
  { nome: "Régis Albuquerque", total: 215, ativos: 182 },
  { nome: "Outros / Apoio", total: 168, ativos: 142 },
];

export default async function EquipePage() {
  const supabase = getSupabaseClient();
  let equipe: { nome: string; total: number; ativos: number }[] = [];
  let totalProcessosAtivos = 0;
  let isLive = false;

  if (supabase) {
    try {
      const { data: processos, error } = await supabase
        .from("processos")
        .select("responsavel, status_resultado");

      if (!error && processos && processos.length > 0) {
        const cargaPorAdvogado: Record<string, { total: number; ativos: number }> = {};

        processos.forEach((proc: ProcessoMinimo) => {
          const resp = proc.responsavel?.trim() || "Não Atribuído";
          const isAtivo =
            proc.status_resultado?.toLowerCase().includes("andamento") || false;

          if (isAtivo) totalProcessosAtivos++;

          if (!cargaPorAdvogado[resp]) {
            cargaPorAdvogado[resp] = { total: 0, ativos: 0 };
          }

          cargaPorAdvogado[resp].total += 1;
          if (isAtivo) cargaPorAdvogado[resp].ativos += 1;
        });

        equipe = Object.entries(cargaPorAdvogado)
          .map(([nome, dados]) => ({ nome, ...dados }))
          .sort((a, b) => b.total - a.total);

        isLive = true;
      }
    } catch {
      // Falha de conexão: utiliza fallback
    }
  }

  // Fallback seguro se o Supabase não estiver povoado
  if (equipe.length === 0) {
    equipe = [...DADOS_AUDITORIA_EQUIPE];
    totalProcessosAtivos = equipe.reduce((acc, curr) => acc + curr.ativos, 0);
  }

  // Métricas e KPIs
  const totalMembros = equipe.length;
  const advogadoComMaiorCarga =
    equipe.length > 0 ? equipe[0] : { nome: "N/A", total: 0, ativos: 0 };
  const maxCarga = advogadoComMaiorCarga.total || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
            <Users className="text-[#2563EB] w-8 h-8" />
            Equipe & Distribuição de Carga
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Monitore o volume operacional e o balanceamento de demandas por advogado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border font-semibold ${
              isLive
                ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]"
                : "bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] shadow-2xs"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            {isLive ? "Supabase Conectado (Live)" : "Auditoria Consolidada"}
          </span>
        </div>
      </div>

      {/* Grid de KPIs da Equipe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membros Ativos */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-[#DBEAFE] text-[#2563EB] rounded-xl border border-[#BFDBFE]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Advogados no Acervo
            </p>
            <p className="text-2xl font-bold text-[#1F2937] mt-0.5">{totalMembros}</p>
          </div>
        </div>

        {/* Maior Volume Individual */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-[#FEF9C3] text-[#854D0E] rounded-xl border border-[#FEF08A]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Maior Carga ({advogadoComMaiorCarga.nome.split(" ")[0]})
            </p>
            <p className="text-2xl font-bold text-[#1F2937] mt-0.5">
              {advogadoComMaiorCarga.total.toLocaleString("pt-BR")}{" "}
              <span className="text-xs font-normal text-[#6B7280]">processos</span>
            </p>
          </div>
        </div>

        {/* Total de Ações Ativas */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="p-3.5 bg-[#DCFCE7] text-[#166534] rounded-xl border border-[#BBF7D0]">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Ações Ativas (Em Andamento)
            </p>
            <p className="text-2xl font-bold text-[#166534] mt-0.5">
              {totalProcessosAtivos.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Distribuição de Carga com Barras Visuais */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2937] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              Volume de Processos por Advogado
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Ranqueamento proporcional baseado no líder do acervo
            </p>
          </div>
        </div>

        <div className="p-6 space-y-7">
          {equipe.map((advogado, index) => {
            const percentualBarra = Math.round((advogado.total / maxCarga) * 100);
            const taxaAtivos = Math.round(
              (advogado.ativos / (advogado.total || 1)) * 100
            );

            return (
              <div key={advogado.nome} className="relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9CA3AF] w-5 font-mono">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-[#1F2937] text-sm">
                      {advogado.nome}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF]">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#1F2937] font-mono text-sm">
                      {advogado.total.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-[#6B7280] ml-1.5">processos</span>
                  </div>
                </div>

                {/* Barra de Progresso Principal com Sub-barra de Ativos */}
                <div className="w-full bg-[#F3F4F6] rounded-full h-3 overflow-hidden flex border border-[#E5E7EB]">
                  <div
                    className="bg-[#93C5FD] h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${percentualBarra}%` }}
                  >
                    <div
                      className="bg-[#2563EB] h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${taxaAtivos}%` }}
                      title={`${advogado.ativos} processos ativos`}
                    />
                  </div>
                </div>

                {/* Detalhes finos abaixo da barra */}
                <div className="flex justify-between mt-1.5 text-xs text-[#6B7280] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    {advogado.ativos.toLocaleString("pt-BR")} ativos ({taxaAtivos}%)
                  </span>
                  <span>{percentualBarra}% da carga máxima</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
