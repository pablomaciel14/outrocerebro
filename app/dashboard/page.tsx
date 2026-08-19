import React from "react";
import Link from "next/link";
import { getResumoAcervo, getAllProcessos } from "@/lib/acervo";
import { 
  AlarmClock, 
  ArrowRight, 
  ArrowUpRight, 
  Scale, 
  Briefcase, 
  CircleDollarSign, 
  Users, 
  AlertCircle,
  Database
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const resumo = getResumoAcervo();
  const todosProcessos = getAllProcessos();
  const recentes = todosProcessos.slice(0, 5);

  const prazosRadar = [
    {
      dia: "22",
      mes: "AGO",
      titulo: "Contestação - Ação Ordinária Enel",
      processo: "0832161-76.2026.8.23.0010",
      responsavel: "Pablo Ramon",
      diasLabel: "Vence em 3 dias",
      urgencia: "alta",
    },
    {
      dia: "25",
      mes: "AGO",
      titulo: "Réplica à Contestação Sicredi",
      processo: "0840769-97.2025.8.23.0010",
      responsavel: "Carlos Leandro",
      diasLabel: "Esta semana",
      urgencia: "media",
    },
    {
      dia: "28",
      mes: "AGO",
      titulo: "Manifestação sobre Laudo Pericial",
      processo: "0834704-52.2026.8.23.0010",
      responsavel: "Wagner Vinícius",
      diasLabel: "Próximos 15 dias",
      urgencia: "normal",
    },
  ];

  const formatarMoedaCompacta = (val: number) => {
    if (val >= 1000000) {
      return `R$ ${(val / 1000000).toFixed(1).replace(".", ",")} mi`;
    }
    if (val >= 1000) {
      return `R$ ${(val / 1000).toFixed(1).replace(".", ",")} mil`;
    }
    return `R$ ${val.toLocaleString("pt-BR")}`;
  };

  const topAdvogados = resumo.porResponsavel.slice(0, 5);
  const maxAdvogado = topAdvogados[0]?.total || 1;

  return (
    <div className="max-w-6xl mx-auto space-y-7">
      {/* 1. Radar de Prazos (Hero Card) */}
      <section className="bg-gradient-to-b from-white to-[#FDFDFE] border border-[#E7E8EC] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-[#F4F5F7] bg-gradient-to-b from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center font-bold">
              <AlarmClock size={18} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#131822] tracking-tight">Radar de Prazos Fatais</h2>
              <span className="text-xs text-[#9CA3AF]">Acompanhamento estratégico de intimações e vencimentos</span>
            </div>
          </div>
          <Link
            href="/dashboard/prazos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>Abrir agenda completa</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Métricas do Radar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#F4F5F7]">
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">Vence em 3 dias</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">01</div>
            <div className="text-xs text-[#6B7280] mt-1">Contestação Enel</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#854D0E] uppercase tracking-wider">Esta semana</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">04</div>
            <div className="text-xs text-[#6B7280] mt-1">2 em elaboração</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider">Próximos 15 dias</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">12</div>
            <div className="text-xs text-[#6B7280] mt-1">Distribuídos na equipe</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#166534] uppercase tracking-wider">Cumpridos no mês</div>
            <div className="font-mono text-3xl font-bold text-[#166534] mt-1.5">37</div>
            <div className="text-xs text-[#6B7280] mt-1">100% de pontualidade</div>
          </div>
        </div>

        {/* Lista Rápida de Prazos */}
        <div className="border-t border-[#F4F5F7] divide-y divide-[#F9FAFB]">
          {prazosRadar.map((item) => (
            <div
              key={item.processo}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF9] transition-colors text-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${item.urgencia === "alta" ? "bg-[#DC2626]" : item.urgencia === "media" ? "bg-[#EAB308]" : "bg-[#2563EB]"}`} />
                <div className="w-14 shrink-0 font-mono">
                  <span className="font-bold text-[#131822] text-sm">{item.dia}</span>
                  <span className="text-[10px] text-[#9CA3AF] ml-1 uppercase">{item.mes}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#131822] truncate">{item.titulo}</div>
                <div className="text-xs text-[#9CA3AF] font-mono mt-0.5">{item.processo}</div>
              </div>

              <div className="text-xs text-[#6B7280] sm:w-28 shrink-0">{item.responsavel}</div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                item.urgencia === "alta" 
                  ? "bg-[#FEE2E2] text-[#991B1B]" 
                  : item.urgencia === "media" 
                  ? "bg-[#FEF9C3] text-[#854D0E]" 
                  : "bg-[#DBEAFE] text-[#1E40AF]"
              }`}>
                {item.diasLabel}
              </span>

              <Link
                href={`/dashboard/processos/${encodeURIComponent(item.processo)}`}
                className="p-1.5 border border-[#E7E8EC] rounded-lg text-[#6B7280] hover:text-[#131822] hover:bg-[#F4F5F7] transition-colors self-end sm:self-center"
              >
                <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Strip de Indicadores do Acervo (Dados Reais) */}
      <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F4F5F7] overflow-hidden">
        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Acervo Total</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1">
            {resumo.total.toLocaleString("pt-BR")}
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">Processos cadastrados</div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Em Andamento</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1 flex items-baseline gap-2">
            <span>{resumo.ativos.toLocaleString("pt-BR")}</span>
            <span className="text-xs font-bold text-[#166534]">99,9%</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">Ações ativas no judiciário</div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Matéria Cível</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1 flex items-baseline gap-2">
            <span>3.518</span>
            <span className="text-xs font-bold text-[#2563EB]">90,6%</span>
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">Predominância contenciosa</div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Valor sob Gestão</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#2563EB] mt-1">
            {formatarMoedaCompacta(resumo.valorTotal)}
          </div>
          <div className="text-xs text-[#6B7280] mt-0.5">Soma dos valores das causas</div>
        </div>
      </section>

      {/* 3. Grid Principal: Movimentações Recentes & Carga por Advogado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Movimentações Recentes do Acervo Real */}
        <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#F4F5F7]">
            <div>
              <h2 className="text-base font-bold text-[#131822]">Movimentações Recentes</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Últimos processos sincronizados no acervo</p>
            </div>
            <Link
              href="/dashboard/processos"
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Ver todos ({resumo.total.toLocaleString("pt-BR")})
            </Link>
          </div>

          <div className="divide-y divide-[#F9FAFB]">
            {recentes.map((item) => (
              <Link
                key={item.n}
                href={`/dashboard/processos/${encodeURIComponent(item.n)}`}
                className="flex items-center justify-between p-4 px-5 hover:bg-[#FAFAF9] transition-colors group"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="font-mono text-xs font-bold text-[#131822] group-hover:text-[#2563EB] transition-colors truncate">
                    {item.n}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1 truncate">
                    <span className="font-semibold text-[#374151]">{item.aut}</span>
                    <span className="text-[#D1D5DB] mx-1.5">·</span>
                    <span>{item.mat}</span>
                    <span className="text-[#D1D5DB] mx-1.5">·</span>
                    <span className="text-[#9CA3AF]">{item.res}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBEAFE] text-[#1E40AF] shrink-0">
                  {item.sta}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Carga por Advogado (Dados Reais da Equipe) */}
        <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#F4F5F7]">
            <div>
              <h2 className="text-base font-bold text-[#131822]">Carga por Advogado</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Distribuição das carteiras ativas</p>
            </div>
            <Link
              href="/dashboard/equipe"
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Ver equipe
            </Link>
          </div>

          <div className="p-5 space-y-4">
            {topAdvogados.map((adv, idx) => {
              const pct = Math.round((adv.total / maxAdvogado) * 100);
              return (
                <div key={adv.nome} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#131822]">
                      <span className="text-[#9CA3AF] font-mono mr-1.5">#{idx + 1}</span>
                      {adv.nome}
                    </span>
                    <span className="font-mono font-bold text-[#6B7280]">
                      {adv.total.toLocaleString("pt-BR")}{" "}
                      <span className="text-[10px] text-[#9CA3AF] font-sans font-normal">
                        ({formatarMoedaCompacta(adv.valor)})
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F5F7] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
