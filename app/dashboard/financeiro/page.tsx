import React from "react";
import { CircleDollarSign, TrendingUp, DollarSign, ArrowUpRight } from "lucide-react";

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
          <CircleDollarSign className="text-[#2563EB] w-8 h-8" strokeWidth={1.5} />
          Honorários & Gestão Financeira
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Controle de honorários contratuais, sucumbenciais e custas processuais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Honorários Previstos</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-2">R$ 1.840.000</p>
          <p className="text-xs text-[#166534] font-semibold mt-1">Em contratos ativos</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Sucumbência em Execução</p>
          <p className="text-3xl font-bold text-[#2563EB] mt-2">R$ 412.500</p>
          <p className="text-xs text-[#6B7280] mt-1">Sentenças favoráveis transitadas</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Faturamento do Mês</p>
          <p className="text-3xl font-bold text-[#166534] mt-2">R$ 148.200</p>
          <p className="text-xs text-[#6B7280] mt-1">Recebimentos consolidados</p>
        </div>
      </div>
    </div>
  );
}
