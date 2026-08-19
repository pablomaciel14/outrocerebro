import React from "react";
import { Settings, Shield, User, Database, FileSpreadsheet } from "lucide-react";
import { ImportadorPlanilha } from "@/components/ImportadorPlanilha";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-[#131822] tracking-tight flex items-center gap-2.5">
          <Settings className="text-[#2563EB] w-6 h-6" strokeWidth={1.8} />
          <span>Configurações & Sincronização</span>
        </h1>
        <p className="text-xs text-[#6B7280] mt-1">
          Preferências do ambiente, conexões com Supabase e sincronização em lote de planilhas.
        </p>
      </div>

      {/* Componente de Importação de Planilha (Upsert) */}
      <ImportadorPlanilha />

      {/* Parâmetros do Escritório e Banco de Dados */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#F4F5F7]">
          <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
            <User size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#131822]">Perfil do Titular</h2>
            <p className="text-xs text-[#6B7280]">Pablo Maciel (pablo@outrocerebro.com.br) · 1.758 processos atribuídos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-[#F4F5F7]">
          <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center shrink-0">
            <Database size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#131822]">Banco de Dados & Tabela de Processos</h2>
            <p className="text-xs text-[#166534] font-semibold">Supabase PostgreSQL (Tabela `processos` ativa com chave única `numero_processo`)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center shrink-0">
            <Shield size={18} strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#131822]">Segurança & Sessão Criptografada</h2>
            <p className="text-xs text-[#6B7280]">Sessões assinadas com HMAC SHA-256 e cookies blindados `__Host-oc_session`</p>
          </div>
        </div>
      </div>
    </div>
  );
}
