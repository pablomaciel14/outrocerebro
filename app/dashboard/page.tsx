import React from "react";
import Link from "next/link";
import { 
  AlarmClock, 
  ArrowRight, 
  ArrowUpRight 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardOverviewPage() {
  const prazosLista = [
    {
      dia: "22",
      mes: "AGO",
      titulo: "Contestação — Ação Ordinária Enel",
      processo: "0014285-42.2023.8.19.0001",
      responsavel: "Pablo Maciel",
      diasBadge: "3 dias",
      urgente: true,
    },
    {
      dia: "25",
      mes: "AGO",
      titulo: "Réplica à Contestação — Banco Sicredi",
      processo: "0840769-97.2025.8.23.0010",
      responsavel: "Thiago Pires",
      diasBadge: "6 dias",
      urgente: false,
    },
    {
      dia: "28",
      mes: "AGO",
      titulo: "Manifestação sobre Laudo Pericial — Construshop",
      processo: "0834704-52.2026.8.23.0010",
      responsavel: "Lucas Pires",
      diasBadge: "9 dias",
      urgente: false,
    },
  ];

  const movimentacoesRecentes = [
    {
      numero: "0832161-76.2026.8.23.0010",
      autor: "JOÃO ANTONIO VALENTIM RODRIGUES",
      materia: "Cível",
      status: "Em andamento",
    },
    {
      numero: "0801512-17.2026.8.23.0047",
      autor: "MARIA E SILVA BARROS",
      materia: "Cível",
      status: "Em andamento",
    },
    {
      numero: "0800546-22.2026.8.23.0090",
      autor: "JOCELIANE XAVIER CONSTANTINO",
      materia: "Administrativo",
      status: "Em andamento",
    },
    {
      numero: "0800012-27.2026.8.23.0010",
      autor: "LEONARDO PEREIRA LIMA",
      materia: "Cível",
      status: "Em andamento",
    },
  ];

  const equipeCarga = [
    { nome: "Pablo Maciel", total: 1758, pct: 100 },
    { nome: "Thiago Pires", total: 992, pct: 56 },
    { nome: "Lucas Pires", total: 417, pct: 24 },
    { nome: "João Vitor", total: 377, pct: 21 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 3. Componente 1: Radar de prazos (Card principal) */}
      <section className="bg-gradient-to-b from-white to-[#FDFDFE] border border-[#E7E8EC] rounded-2xl shadow-xs overflow-hidden">
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#F4F5F7] bg-gradient-to-b from-blue-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center font-bold">
              <AlarmClock size={17} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#131822] tracking-tight">Radar de prazos</h2>
              <p className="text-xs text-[#9CA3AF]">quarta, 19 de agosto de 2026</p>
            </div>
          </div>
          <Link
            href="/dashboard/prazos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            <span>Abrir agenda</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Resumo em 4 colunas no topo */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#F4F5F7]">
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#DC2626] uppercase tracking-wider">VENCE EM 3 DIAS</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">01</div>
            <div className="text-xs text-[#6B7280] mt-1">Contestação Enel</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#854D0E] uppercase tracking-wider">ESTA SEMANA</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">04</div>
            <div className="text-xs text-[#6B7280] mt-1">2 sem peça iniciada</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider">PRÓXIMOS 15 DIAS</div>
            <div className="font-mono text-3xl font-bold text-[#131822] mt-1.5">12</div>
            <div className="text-xs text-[#6B7280] mt-1">Distribuídos na equipe</div>
          </div>
          <div className="p-5">
            <div className="text-[11px] font-bold text-[#166534] uppercase tracking-wider">CUMPRIDOS NO MÊS</div>
            <div className="font-mono text-3xl font-bold text-[#166534] mt-1.5">37</div>
            <div className="text-xs text-[#6B7280] mt-1">Nenhuma perda de prazo</div>
          </div>
        </div>

        {/* Lista de Prazos (Linhas de dados) */}
        <div className="border-t border-[#F4F5F7] divide-y divide-[#F9FAFB]">
          {prazosLista.map((item) => (
            <div
              key={item.processo}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-3.5 hover:bg-[#FAFAF9] transition-colors text-sm"
            >
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.urgente ? "bg-[#DC2626]" : "bg-[#2563EB]"}`} />
                <div className="w-14 shrink-0 font-mono">
                  <span className="font-bold text-[#131822] text-sm">{item.dia}</span>
                  <span className="text-[10px] text-[#9CA3AF] ml-1 uppercase">{item.mes}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-[#131822] truncate">{item.titulo}</div>
                <div className="text-xs text-[#9CA3AF] font-mono mt-0.5">{item.processo}</div>
              </div>

              <div className="text-xs text-[#6B7280] sm:w-28 shrink-0">{item.responsavel}</div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                item.urgente 
                  ? "bg-[#FEE2E2] text-[#991B1B]" 
                  : "bg-[#DBEAFE] text-[#1E40AF]"
              }`}>
                {item.diasBadge}
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

      {/* 4. Componente 2: KPIs do Acervo */}
      <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-xs grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F4F5F7] overflow-hidden">
        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">ACERVO TOTAL</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1">
            3.927
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">EM ANDAMENTO</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1 flex items-baseline gap-2">
            <span>3.322</span>
            <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              84,6%
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">AÇÕES CÍVEIS</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1 flex items-baseline gap-2">
            <span>3.552</span>
            <span className="text-xs font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
              90,4%
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">HONORÁRIOS PREVISTOS</div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#131822] mt-1">
            R$ 1,84 mi
          </div>
        </div>
      </section>

      {/* 5. Componente 3 e 4: Rodapé Dividido (Grid de 2 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Coluna Esquerda: Movimentações recentes */}
        <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#F4F5F7]">
            <div>
              <h2 className="text-base font-bold text-[#131822]">Movimentações recentes</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Últimos processos sincronizados</p>
            </div>
            <Link
              href="/dashboard/processos"
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Ver todos
            </Link>
          </div>

          <div className="divide-y divide-[#F9FAFB]">
            {movimentacoesRecentes.map((item) => (
              <Link
                key={item.numero}
                href={`/dashboard/processos/${encodeURIComponent(item.numero)}`}
                className="flex items-center justify-between p-4 px-5 hover:bg-[#FAFAF9] transition-colors group"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="font-mono text-xs font-bold text-[#131822] group-hover:text-[#2563EB] transition-colors truncate">
                    {item.numero}
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1 truncate">
                    <span>{item.autor}</span>
                    <span className="text-[#D1D5DB] mx-1.5">·</span>
                    <span>{item.materia}</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBEAFE] text-[#1E40AF] shrink-0">
                  {item.status}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Coluna Direita: Carga por advogado */}
        <section className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#F4F5F7]">
            <div>
              <h2 className="text-base font-bold text-[#131822]">Carga por advogado</h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Distribuição de processos na equipe</p>
            </div>
            <Link
              href="/dashboard/equipe"
              className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Equipe
            </Link>
          </div>

          <div className="p-5 space-y-4">
            {equipeCarga.map((adv) => (
              <div key={adv.nome} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#131822]">{adv.nome}</span>
                  <span className="font-mono font-bold text-[#6B7280]">
                    {adv.total.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="w-full bg-[#F4F5F7] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-2 rounded-full transition-all duration-700"
                    style={{ width: `${adv.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
