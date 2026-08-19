import React from "react";
import { Settings, Shield, User, Bell, Database } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
          <Settings className="text-[#2563EB] w-8 h-8" strokeWidth={1.5} />
          Configurações do Sistema
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Preferências do ambiente, conexões e parâmetros do escritório.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB]">
          <User className="w-5 h-5 text-[#2563EB]" strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Perfil do Titular</h2>
            <p className="text-xs text-[#6B7280]">Pablo Maciel (pablo@outrocerebro.com.br)</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-[#E5E7EB]">
          <Database className="w-5 h-5 text-[#2563EB]" strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Conexão de Banco de Dados</h2>
            <p className="text-xs text-[#166534] font-medium">Supabase PostgreSQL (Tabela processos conectada)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#2563EB]" strokeWidth={1.5} />
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Segurança & Sessão</h2>
            <p className="text-xs text-[#6B7280]">Autenticação HMAC SHA-256 e cookies blindados com SameSite=Strict</p>
          </div>
        </div>
      </div>
    </div>
  );
}
