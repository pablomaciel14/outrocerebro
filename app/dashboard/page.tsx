import React from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { KpiCard } from "@/components/KpiCard";
import { RecentCases } from "@/components/RecentCases";
import { 
  Briefcase, 
  Scale, 
  AlertCircle, 
  Users, 
  Database,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface ProcessoItem {
  numero_processo: string;
  autor?: string;
  materia?: string;
  status_resultado?: string;
  data_entrada?: string;
}

export default async function DashboardPage() {
  const supabase = getSupabaseClient();

  // Valores padrão/fallback (baseados na auditoria consolidada de 3.927 processos)
  let totalProcessos: number = 3927;
  let totalCivel: number = 3552;
  let emAndamento: number = 3322;
  let processosRecentes: ProcessoItem[] = [
    {
      numero_processo: "0014285-42.2023.8.19.0001",
      autor: "Âmbar Energia S.A.",
      materia: "Cível",
      status_resultado: "Em andamento",
    },
    {
      numero_processo: "0803192-11.2022.8.19.0002",
      autor: "Particular / Consumidor",
      materia: "Cível",
      status_resultado: "Sentença favorável",
    },
    {
      numero_processo: "5002144-88.2024.4.02.5101",
      autor: "Particular / Tributário",
      materia: "Tributário",
      status_resultado: "Em andamento",
    },
  ];
  let isLiveSupabase = false;

  if (supabase) {
    try {
      const { count: countTotal, error: errTotal } = await supabase
        .from("processos")
        .select("*", { count: "exact", head: true });

      const { count: countAndamento } = await supabase
        .from("processos")
        .select("*", { count: "exact", head: true })
        .ilike("status_resultado", "%andamento%");

      const { count: countCivel } = await supabase
        .from("processos")
        .select("*", { count: "exact", head: true })
        .ilike("materia", "%Cível%");

      const { data: dataRecentes } = await supabase
        .from("processos")
        .select("numero_processo, autor, materia, status_resultado, data_entrada")
        .order("data_entrada", { ascending: false })
        .limit(5);

      if (!errTotal && typeof countTotal === "number" && countTotal > 0) {
        totalProcessos = countTotal;
        isLiveSupabase = true;
        if (typeof countAndamento === "number") emAndamento = countAndamento;
        if (typeof countCivel === "number") totalCivel = countCivel;
        if (dataRecentes && dataRecentes.length > 0) {
          processosRecentes = dataRecentes as ProcessoItem[];
        }
      }
    } catch {
      // Fallback seguro
    }
  }

  const percentualCivel = totalProcessos > 0 
    ? ((totalCivel / totalProcessos) * 100).toFixed(1).replace(".", ",") + "% do acervo"
    : "0%";

  const percentualAndamento = totalProcessos > 0 
    ? ((emAndamento / totalProcessos) * 100).toFixed(1).replace(".", ",") + "% ativos"
    : "0%";

  const cargaEquipe = [
    { nome: "Pablo Maciel", valor: 1758, width: "w-[100%]" },
    { nome: "Thiago Pires", valor: 992, width: "w-[56%]" },
    { nome: "Lucas Pires", valor: 417, width: "w-[24%]" },
    { nome: "João Vitor", valor: 377, width: "w-[21%]" },
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight">Visão Geral do Acervo</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Métricas estratégicas e distribuição da carteira jurídica.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 border font-semibold ${
            isLiveSupabase 
              ? "bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]" 
              : "bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] shadow-2xs"
          }`}>
            <Database className="w-3.5 h-3.5" />
            {isLiveSupabase ? "Supabase Conectado (Live)" : "Auditoria Consolidada (3.927 proc.)"}
          </span>
        </div>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Acervo Total"
          value={totalProcessos}
          subtitle="Processos auditados"
          icon={Briefcase}
          variant="default"
        />

        <KpiCard
          title="Em Andamento"
          value={emAndamento}
          subtitle={percentualAndamento}
          icon={AlertCircle}
          variant="blue"
        />

        <KpiCard
          title="Ações Cíveis"
          value={totalCivel}
          subtitle={percentualCivel}
          icon={Scale}
          variant="green"
        />

        <KpiCard
          title="Principais Clientes"
          value="Particulares & Âmbar"
          subtitle="Segmento prioritário"
          icon={Users}
          variant="amber"
        />
      </div>

      {/* Grid Principal: Movimentações Recentes & Carga por Advogado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Movimentações Recentes */}
        <div className="lg:col-span-2">
          <RecentCases cases={processosRecentes} />
        </div>

        {/* Carga por Advogado */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-bold text-[#1F2937]">Carga por Advogado</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">Top responsáveis do acervo</p>
              </div>
              <Link 
                href="/dashboard/equipe" 
                className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
              >
                Equipe
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-5">
              {cargaEquipe.map((adv) => (
                <div key={adv.nome} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#1F2937] font-semibold">{adv.nome}</span>
                    <span className="text-[#6B7280] font-bold">{adv.valor.toLocaleString("pt-BR")} proc.</span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] rounded-full h-2.5 overflow-hidden">
                    <div className={`bg-[#2563EB] h-2.5 rounded-full ${adv.width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
