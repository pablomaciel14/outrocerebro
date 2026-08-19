import React from "react";
import { Settings, Database, Shield, HardDrive, FileSpreadsheet, Zap } from "lucide-react";
import { ImportadorPlanilha } from "@/components/ImportadorPlanilha";
import { SincronizadorAmbar } from "@/components/SincronizadorAmbar";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
          <Settings className="text-[#2563EB]" size={30} strokeWidth={1.5} />
          <span>Configurações & Central de Sincronização</span>
        </h1>
        <p className="text-[#6B7280] mt-1.5 text-sm sm:text-base">
          Hub de importação em lote, reconciliação de relatórios corporativos e parâmetros do escritório.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Menu Lateral Interno */}
        <div className="lg:col-span-1 space-y-2 sticky top-24">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1F2937] font-semibold shadow-xs transition-all text-left text-xs sm:text-sm">
            <Database size={18} className="text-[#2563EB]" strokeWidth={1.5} />
            <span>Sincronização de Dados</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] rounded-xl text-[#6B7280] font-medium transition-all text-left text-xs sm:text-sm">
            <Shield size={18} strokeWidth={1.5} />
            <span>Segurança e Sessões</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] rounded-xl text-[#6B7280] font-medium transition-all text-left text-xs sm:text-sm">
            <HardDrive size={18} strokeWidth={1.5} />
            <span>Armazenamento & Backups</span>
          </button>
        </div>

        {/* Área Principal: Hub de Sincronização */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Importador Geral CPJ */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  <h2 className="text-base font-bold text-[#1F2937]">Base de Dados Geral (CPJ / Escritório)</h2>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  Atualize o acervo global com a planilha <code className="bg-[#F4F5F7] px-1.5 py-0.5 rounded text-[#1F2937]">Auditoria de cadastro de Processos.xlsx</code>.
                </p>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-[#FAFAFA]">
              <ImportadorPlanilha />
            </div>
          </div>

          {/* Card 2: Sincronizador Especializado Âmbar Energia (22 abas) */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
                  <h2 className="text-base font-bold text-[#1F2937]">Reconciliação Corporativa (Âmbar Energia)</h2>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  Varre as 22 abas do <code className="bg-[#F4F5F7] px-1.5 py-0.5 rounded text-[#1F2937]">Relatório Jurídico Geral.xlsx</code> e cruza Risco de Perda, Andamento e Fases.
                </p>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 bg-[#FAFAFA]">
              <SincronizadorAmbar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
