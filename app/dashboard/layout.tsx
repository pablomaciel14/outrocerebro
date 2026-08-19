import React from "react";
import { requirePersonalUser } from "../personal-auth";
import { Sidebar } from "@/components/Sidebar";
import { Bell } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePersonalUser();

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] text-[#1F2937] antialiased font-sans">
      {/* Sidebar de Navegação */}
      <Sidebar displayName={user.displayName} email={user.email} />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Superior */}
        <header className="h-16 border-b border-[#E5E7EB] bg-[#FFFFFF] px-8 flex items-center justify-between sticky top-0 z-10 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#9CA3AF] font-bold">Painel</span>
            <span className="text-xs text-[#D1D5DB]">/</span>
            <span className="text-sm font-semibold text-[#1F2937]">Gestão Estratégica & KPIs</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Ícone de Notificações / Publicações */}
            <button 
              type="button" 
              className="relative p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] rounded-xl transition-colors cursor-pointer"
              title="Notificações & Publicações"
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563EB]" />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              Sistema Ativo
            </span>
          </div>
        </header>

        {/* Conteúdo Dinâmico */}
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
