import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProcessoByNumero } from "@/lib/acervo";
import EditProcessModal from "@/components/EditProcessModal";
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  Scale, 
  Building, 
  ShieldCheck, 
  DollarSign, 
  Clock 
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProcessoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const processo = getProcessoByNumero(decodedId);

  if (!processo) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#131822]">Processo não localizado</h2>
        <p className="text-sm text-[#6B7280]">
          Não foi possível encontrar o processo com número ou identificador: <span className="font-mono">{decodedId}</span>
        </p>
        <Link
          href="/dashboard/processos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Voltar ao acervo</span>
        </Link>
      </div>
    );
  }

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navegação e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/processos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#131822] transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Voltar para o acervo de processos</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            processo.sta === "Em andamento" 
              ? "bg-[#DBEAFE] text-[#1E40AF]" 
              : "bg-[#DCFCE7] text-[#166534]"
          }`}>
            {processo.sta}
          </span>
          <EditProcessModal
            processoId={processo.n}
            currentStatus={processo.sta}
            currentValue={processo.val}
          />
        </div>
      </div>

      {/* Cartão Principal: Dados do Processo */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#F4F5F7] pb-5">
          <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">Número CNJ</span>
          <h1 className="text-xl sm:text-2xl font-mono font-bold text-[#131822] mt-1">
            {processo.n}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#F4F5F7] text-[#374151]">
              {processo.mat}
            </span>
            {processo.tem && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F9FAFB] border border-[#E7E8EC] text-[#6B7280]">
                {processo.tem}
              </span>
            )}
            {processo.gru && (
              <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F0FDF4] text-[#166534]">
                {processo.gru}
              </span>
            )}
          </div>
        </div>

        {/* Partes do Processo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAFAF9] border border-[#E7E8EC] rounded-xl p-5">
          <div>
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Polo Ativo (Autor)</div>
            <div className="text-sm font-bold text-[#131822] mt-1">{processo.aut || "Não informado"}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Polo Passivo (Réu)</div>
            <div className="text-sm font-bold text-[#131822] mt-1">{processo.reu || "Não informado"}</div>
          </div>
        </div>

        {/* Informações Complementares */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <User size={14} />
              <span>Advogado Responsável</span>
            </div>
            <div className="font-bold text-[#131822]">{processo.res}</div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <Building size={14} />
              <span>Juízo / Comarca</span>
            </div>
            <div className="font-bold text-[#131822]">{processo.jui || "Boa Vista/RR"}</div>
            {processo.org && <div className="text-[#6B7280] text-[11px]">{processo.org}</div>}
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <DollarSign size={14} />
              <span>Valor da Causa</span>
            </div>
            <div className="font-mono text-sm font-bold text-[#2563EB]">
              {processo.val ? formatarMoeda(processo.val) : "Não informado"}
            </div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <Calendar size={14} />
              <span>Data de Entrada</span>
            </div>
            <div className="font-mono text-[#374151]">{processo.ent || "—"}</div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <Clock size={14} />
              <span>Data de Ajuizamento</span>
            </div>
            <div className="font-mono text-[#374151]">{processo.aju || "—"}</div>
          </div>

          <div className="p-4 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[#9CA3AF] font-semibold">
              <Scale size={14} />
              <span>Formato do Processo</span>
            </div>
            <div className="text-[#374151] capitalize">{processo.mei || "Eletrônico"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
