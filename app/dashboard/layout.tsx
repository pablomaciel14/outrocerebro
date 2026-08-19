import React from "react";
import { requirePersonalUser } from "../personal-auth";
import { Sidebar } from "@/components/Sidebar";
import { Bell, Search, ScanSearch } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePersonalUser();

  return (
    <div className="flex min-h-screen bg-[#FAFAF9] text-[#131822] antialiased font-sans">
      {/* 1. Sidebar Fixa */}
      <Sidebar displayName={user.displayName} email={user.email} />

      {/* 2. Área Principal com Header */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header da Área Principal */}
        <header className="h-[68px] flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-[#E7E8EC] px-7 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h1 className="text-lg font-bold text-[#131822] tracking-tight whitespace-nowrap">
              Visão geral
            </h1>
            <span className="text-xs text-[#9CA3AF] hidden sm:inline whitespace-nowrap truncate">
              Prazos, acervo e carga da equipe
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Barra de Pesquisa */}
            <div className="flex items-center gap-2 h-9 px-3 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl text-[#9CA3AF] text-xs w-56 sm:w-72 focus-within:border-[#2563EB] transition-colors shadow-2xs">
              <Search size={15} strokeWidth={1.8} className="shrink-0" />
              <input
                type="text"
                placeholder="Buscar processo, cliente…"
                className="w-full bg-transparent border-0 outline-none text-xs text-[#131822] placeholder:text-[#9CA3AF]"
              />
              <span className="w-5 h-5 rounded bg-[#F4F5F7] text-[#6B7280] hidden sm:flex items-center justify-center shrink-0">
                <ScanSearch size={13} strokeWidth={1.8} />
              </span>
            </div>

            {/* Ícone de Sino com Ponto Vermelho */}
            <button
              type="button"
              className="relative h-9 w-9 flex items-center justify-center bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl text-[#4B5563] hover:text-[#131822] hover:bg-[#F9FAFB] transition-colors shadow-2xs"
              title="Prazos vencendo & Notificações"
            >
              <Bell size={17} strokeWidth={1.8} />
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#FAFAF9]">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1 p-6 sm:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
