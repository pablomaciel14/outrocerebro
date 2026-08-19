import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { EditProcessModal } from "@/components/EditProcessModal";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  DollarSign, 
  Scale, 
  Clock
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProcessoDetalhe {
  id: string;
  numero_processo: string;
  autor?: string;
  reu?: string;
  materia?: string;
  tema?: string;
  grupo_trabalho?: string;
  responsavel?: string;
  acao?: string;
  juizo?: string;
  advogado?: string;
  data_ajuizamento?: string;
  data_entrada?: string;
  valor_causa?: number;
  status_resultado?: string;
}

const PROCESSOS_MOCK: Record<string, ProcessoDetalhe> = {
  "1": {
    id: "1",
    numero_processo: "0014285-42.2023.8.19.0001",
    autor: "Âmbar Energia S.A.",
    reu: "Concessionária Enel Distribuição Rio",
    materia: "Cível",
    tema: "Direito de Energia & Regulatório",
    grupo_trabalho: "Contencioso Estratégico",
    responsavel: "Pablo Maciel",
    acao: "Ação Ordinária de Reparação de Danos com Tutela de Urgência",
    juizo: "5ª Vara Cível da Comarca da Capital - TJRJ",
    advogado: "Pablo Maciel e Advogados Associados",
    data_ajuizamento: "2023-04-12",
    data_entrada: "2023-04-10",
    valor_causa: 450000.0,
    status_resultado: "Em andamento",
  },
  "2": {
    id: "2",
    numero_processo: "0803192-11.2022.8.19.0002",
    autor: "Particular / Consumidor",
    reu: "Banco Santander Brasil S.A.",
    materia: "Cível",
    tema: "Direito do Consumidor & Bancário",
    grupo_trabalho: "Contencioso Geral",
    responsavel: "Thiago Pires",
    acao: "Ação Revisional de Cláusulas Contratuais",
    juizo: "2ª Vara Cível - Regional de Niterói",
    advogado: "Thiago Pires",
    data_ajuizamento: "2022-08-15",
    data_entrada: "2022-08-10",
    valor_causa: 32000.0,
    status_resultado: "Sentença favorável",
  },
};

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getSupabaseClient();
  let processo: ProcessoDetalhe | null = null;

  if (client) {
    try {
      const { data, error } = await client
        .from("processos")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        processo = data as ProcessoDetalhe;
      }
    } catch {
      // Fallback local
    }
  }

  if (!processo) {
    processo = PROCESSOS_MOCK[id] || PROCESSOS_MOCK["1"];
  }

  if (!processo) {
    notFound();
  }

  const formatarMoeda = (valor?: number) => {
    if (typeof valor !== "number" || isNaN(valor)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return "Não informada";
    try {
      const d = new Date(dataStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Barra de Navegação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/dashboard/processos"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6B7280] hover:text-[#1F2937] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o acervo de processos</span>
        </Link>
        <div className="flex items-center gap-3">
          <EditProcessModal
            processoId={processo.id}
            statusAtual={processo.status_resultado || "Em andamento"}
            valorAtual={processo.valor_causa || 0}
          />
        </div>
      </div>

      {/* Cartão de Destaque / Cabeçalho do Processo */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                Processo Judicial
              </span>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  processo.status_resultado?.toLowerCase().includes("favorável")
                    ? "bg-[#DCFCE7] text-[#166534]"
                    : processo.status_resultado?.toLowerCase().includes("andamento")
                    ? "bg-[#DBEAFE] text-[#1E40AF]"
                    : "bg-[#FEF9C3] text-[#854D0E]"
                }`}
              >
                {processo.status_resultado || "Em andamento"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
              {processo.numero_processo}
            </h1>
            <p className="text-sm font-medium text-[#4B5563] max-w-3xl">
              {processo.acao || "Ação Ordinária"}
            </p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#E5E7EB] p-5 rounded-2xl flex items-center gap-4 shrink-0">
            <div className="p-3 bg-[#DCFCE7] text-[#166534] rounded-xl border border-[#BBF7D0]">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                Valor da Causa
              </p>
              <p className="text-2xl font-bold text-[#1F2937] mt-0.5">
                {formatarMoeda(processo.valor_causa)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Seções de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seção 1: Partes Envolvidas */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB]">
            <User className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1F2937]">Partes do Processo</h2>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Polo Ativo (Autor)
              </span>
              <p className="text-sm font-bold text-[#1F2937] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {processo.autor || "Não informado"}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Polo Passivo (Réu)
              </span>
              <p className="text-sm font-semibold text-[#374151] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {processo.reu || "Não informado"}
              </p>
            </div>
          </div>
        </div>

        {/* Seção 2: Classificação e Tema */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB]">
            <Scale className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1F2937]">Classificação Jurídica</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Matéria
              </span>
              <p className="text-sm font-bold text-[#1F2937] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {processo.materia || "Cível"}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Tema Específico
              </span>
              <p className="text-sm font-semibold text-[#374151] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl truncate">
                {processo.tema || "Geral"}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
              Juízo / Foro Competente
            </span>
            <p className="text-sm font-semibold text-[#374151] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
              {processo.juizo || "Não informado"}
            </p>
          </div>
        </div>

        {/* Seção 3: Gestão Interna e Responsável */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB]">
            <Building className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1F2937]">Gestão Interna</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Advogado Responsável
              </span>
              <p className="text-sm font-bold text-[#1F2937] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {processo.responsavel || "Não atribuído"}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1">
                Grupo de Trabalho
              </span>
              <p className="text-sm font-semibold text-[#374151] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl truncate">
                {processo.grupo_trabalho || "Geral"}
              </p>
            </div>
          </div>
        </div>

        {/* Seção 4: Prazos e Datas */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E5E7EB]">
            <Clock className="w-5 h-5 text-[#2563EB]" />
            <h2 className="text-base font-bold text-[#1F2937]">Linha do Tempo</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Data de Entrada
              </span>
              <p className="text-sm font-bold text-[#1F2937] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {formatarData(processo.data_entrada)}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Ajuizamento
              </span>
              <p className="text-sm font-semibold text-[#374151] bg-[#FAFAFA] border border-[#E5E7EB] p-3 rounded-xl">
                {formatarData(processo.data_ajuizamento)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
