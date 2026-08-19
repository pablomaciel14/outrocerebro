import React from "react";
import { Settings, Database, Shield, HardDrive } from "lucide-react";
import { ImportadorPlanilha } from "@/components/ImportadorPlanilha";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
          <Settings className="text-[#2563EB]" size={30} strokeWidth={1.5} />
          <span>Configurações do Sistema</span>
        </h1>
        <p className="text-[#6B7280] mt-1.5 text-sm sm:text-base">
          Gerencie integrações, banco de dados e preferências da sua conta.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Menu Lateral Interno de Configurações */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#1F2937] font-semibold shadow-xs transition-all text-left text-xs sm:text-sm">
            <Database size={18} className="text-[#2563EB]" strokeWidth={1.5} />
            <span>Sincronização de Dados</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] rounded-xl text-[#6B7280] font-medium transition-all text-left text-xs sm:text-sm">
            <Shield size={18} strokeWidth={1.5} />
            <span>Segurança e Permissões</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F3F4F6] rounded-xl text-[#6B7280] font-medium transition-all text-left text-xs sm:text-sm">
            <HardDrive size={18} strokeWidth={1.5} />
            <span>Armazenamento</span>
          </button>
        </div>

        {/* Área de Conteúdo da Configuração Ativa */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#1F2937]">Base de Dados (Supabase)</h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Mantenha o acervo do escritório atualizado importando planilhas do seu sistema de auditoria.
              </p>
            </div>
            
            <div className="p-6 sm:p-8 bg-[#FAFAFA]">
              {/* Componente de upload com Upsert */}
              <ImportadorPlanilha />
            </div>
          </div>

          {/* Cards de configuração futuros */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#E5E7EB] p-6 opacity-60">
            <h2 className="text-base font-bold text-[#1F2937] mb-1">Exportação de Relatórios</h2>
            <p className="text-xs text-[#6B7280]">
              Em breve: Configure backups automáticos semanais em formato CSV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
