import React from "react";
import Link from "next/link";
import { getResumoAcervo } from "@/lib/acervo";
import { Users, Briefcase, DollarSign, Award, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EquipePage() {
  const resumo = getResumoAcervo();
  const advogados = resumo.porResponsavel;
  const maxProcessos = advogados[0]?.total || 1;

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatarMoedaCompacta = (val: number) => {
    if (val >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(1).replace(".", ",")} mi`;
    }
    if (val >= 1000) {
      return `R$ ${(val / 1000).toFixed(1).replace(".", ",")} mil`;
    }
    return `R$ ${val.toLocaleString("pt-BR")}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#131822] tracking-tight">Equipe & Distribuição de Carga</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Monitoramento de produtividade e volume sob responsabilidade de cada advogado ({advogados.length} profissionais)
          </p>
        </div>
      </div>

      {/* Cards de Destaque da Equipe */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#FFFFFF] border border-[#E7E8EC] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center">
              <Users size={20} />
            </span>
            <div>
              <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Advogados Ativos</div>
              <div className="font-mono text-2xl font-bold text-[#131822]">{advogados.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E8EC] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center">
              <Briefcase size={20} />
            </span>
            <div>
              <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Processos Ativos</div>
              <div className="font-mono text-2xl font-bold text-[#131822]">{resumo.ativos.toLocaleString("pt-BR")}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E8EC] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-[#854D0E] flex items-center justify-center">
              <DollarSign size={20} />
            </span>
            <div>
              <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Valor sob Gestão</div>
              <div className="font-mono text-2xl font-bold text-[#131822]">{formatarMoedaCompacta(resumo.valorTotal)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Ranqueada da Equipe com Barras em Dupla Camada */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
        <div className="border-b border-[#F4F5F7] pb-4">
          <h2 className="text-base font-bold text-[#131822]">Ranqueamento e Carteira por Advogado</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            A barra azul representa a proporção de processos ativos em relação à carga total do líder da equipe.
          </p>
        </div>

        <div className="space-y-6">
          {advogados.map((adv, index) => {
            const pctTotal = Math.round((adv.total / maxProcessos) * 100);
            const pctAtivosNoProprio = Math.round((adv.ativos / adv.total) * 100) || 0;

            return (
              <div key={adv.nome} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#F4F5F7] text-[#374151]">
                      #{index + 1}
                    </span>
                    <span className="font-bold text-sm text-[#131822]">{adv.nome}</span>
                    {index === 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF9C3] text-[#854D0E]">
                        <Award size={12} />
                        Líder de Carteira
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#6B7280]">
                      <strong className="text-[#131822] font-mono">{adv.total.toLocaleString("pt-BR")}</strong> processos ({adv.ativos} ativos)
                    </span>
                    <span className="font-mono font-bold text-[#2563EB]">
                      {formatarMoeda(adv.valor)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso com Dupla Camada */}
                <div className="w-full bg-[#F4F5F7] rounded-full h-3.5 overflow-hidden flex">
                  <div
                    className="bg-[#2563EB] h-3.5 rounded-l-full relative transition-all duration-700"
                    style={{ width: `${pctTotal}%` }}
                    title={`${adv.ativos} processos ativos`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
