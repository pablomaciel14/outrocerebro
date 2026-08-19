import React from "react";
import { DatabaseZap, Sparkles, ShieldCheck, Layers } from "lucide-react";
import { ImportadorPlanilha } from "@/components/ImportadorPlanilha";
import { SincronizadorAmbar } from "@/components/SincronizadorAmbar";
import { SincronizadorTarefas } from "@/components/SincronizadorTarefas";

export default function SincronizacaoPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#131822] tracking-tight flex items-center gap-3">
          <DatabaseZap className="text-[#2563EB]" size={30} strokeWidth={1.8} />
          <span>Central de Sincronização & Integrações</span>
        </h1>
        <p className="text-[#6B7280] mt-1.5 text-xs sm:text-sm">
          Importe suas planilhas de diferentes fontes. O motor de conciliação cruzará os dados automaticamente pelo <strong className="text-[#131822]">Número do Processo</strong>.
        </p>
      </div>

      {/* Grid dos Módulos de Sincronização */}
      <div className="space-y-6">
        {/* Módulo 1: Base de Processos (CPJ) */}
        <div className="bg-[#FFFFFF] rounded-2xl shadow-xs border border-[#E7E8EC] overflow-hidden">
          <div className="p-5 border-b border-[#F4F5F7] bg-[#FAFBFD] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h2 className="font-bold text-sm text-[#131822]">Passo 1: Atualização da Base Geral (CPJ / Auditoria)</h2>
            </div>
            <span className="text-[11px] font-mono text-[#6B7280] bg-white border border-[#E7E8EC] px-2.5 py-1 rounded-lg">
              Chave primária: numero_processo
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <ImportadorPlanilha />
          </div>
        </div>

        {/* Módulos 2 e 3 + Card Explicativo em Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Módulo 2: Relatório Âmbar */}
          <div className="lg:col-span-1">
            <SincronizadorAmbar />
          </div>

          {/* Módulo 3: Tarefas e Prazos */}
          <div className="lg:col-span-1">
            <SincronizadorTarefas />
          </div>
          
          {/* Card Explicativo sobre Cruzamento Inteligente */}
          <div className="lg:col-span-1 bg-gradient-to-br from-[#1E3A8A] to-[#1E40AF] p-6 rounded-2xl text-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-xs">
                <Sparkles size={20} className="text-blue-200" />
              </div>
              <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                Como o cruzamento funciona?
              </h3>
              <p className="text-xs text-blue-100/90 leading-relaxed mb-4">
                Ao sincronizar relatórios corporativos ou agendas externas, o <strong className="text-white">Outro Cérebro</strong> utiliza o <strong className="text-white">Número do Processo</strong> como chave mestra:
              </p>
              <ul className="text-xs text-blue-100/90 space-y-2.5 list-disc pl-4">
                <li>Processos novos são cadastrados imediatamente no banco.</li>
                <li>Risco de perda, sentenças e andamentos são sobrescritos com precisão.</li>
                <li>Tarefas e prazos são vinculados à pasta do processo e à pauta do advogado.</li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-blue-200 font-medium">
              <ShieldCheck size={15} />
              <span>Upsert idempotente sem duplicatas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
