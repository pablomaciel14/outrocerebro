"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Scale, 
  AlarmClock, 
  Users, 
  FolderOpen, 
  BarChart3, 
  CircleDollarSign, 
  Smartphone, 
  Settings, 
  LogOut,
  Plus
} from "lucide-react";

interface SidebarProps {
  displayName?: string;
  email?: string;
}

export function Sidebar({ 
  displayName = "Pablo Maciel", 
  email = "pablo@outrocerebro.com.br" 
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // continua para redirecionar
    }
    router.push("/");
    router.refresh();
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  const baseLinkClass = "flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all text-xs font-semibold";
  const activeLinkClass = "bg-[#DBEAFE] text-[#1E40AF] font-bold shadow-2xs";
  const inactiveLinkClass = "text-[#4B5563] hover:bg-[#F4F5F7] hover:text-[#131822]";

  return (
    <aside className="w-64 bg-[#FCFCFD] min-h-screen flex flex-col border-r border-[#E7E8EC] shrink-0 sticky top-0 h-screen">
      {/* 1. Topo: Logo Outro Cérebro - GESTÃO JURÍDICA */}
      <div className="h-[68px] flex items-center gap-3 px-5 border-b border-[#F4F5F7]">
        <div className="w-8 h-8 rounded-lg bg-[#0F1420] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
          <img
            src="/outro-cerebro-symbol.webp"
            alt="Outro Cérebro"
            className="w-6 h-6 object-contain"
          />
        </div>
        <div>
          <div className="text-sm font-bold text-[#131822] tracking-tight leading-tight">Outro Cérebro</div>
          <div className="text-[10px] text-[#9CA3AF] font-bold uppercase tracking-wider">GESTÃO JURÍDICA</div>
        </div>
      </div>

      {/* Botão Primário Azul Largo: + Novo processo */}
      <div className="p-3 pb-1">
        <Link
          href="/dashboard/processos"
          className="w-full flex items-center justify-center gap-2 h-9 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus size={15} strokeWidth={2.2} />
          <span>Novo processo</span>
        </Link>
      </div>

      {/* Navegações */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Navegação 1: OPERAÇÃO */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            OPERAÇÃO
          </p>
          
          <Link 
            href="/dashboard" 
            className={`${baseLinkClass} ${isActive("/dashboard") ? activeLinkClass : inactiveLinkClass}`}
          >
            <LayoutDashboard size={17} strokeWidth={1.7} />
            <span>Visão geral</span>
          </Link>

          <Link 
            href="/dashboard/prazos" 
            className={`${baseLinkClass} ${isActive("/dashboard/prazos") ? activeLinkClass : inactiveLinkClass}`}
          >
            <AlarmClock size={17} strokeWidth={1.7} />
            <span className="flex-1">Prazos</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold bg-[#DC2626] text-white flex items-center justify-center">
              3
            </span>
          </Link>
          
          <Link 
            href="/dashboard/processos" 
            className={`${baseLinkClass} ${isActive("/dashboard/processos") ? activeLinkClass : inactiveLinkClass}`}
          >
            <Scale size={17} strokeWidth={1.7} />
            <span>Processos</span>
          </Link>

          <Link 
            href="/dashboard/equipe" 
            className={`${baseLinkClass} ${isActive("/dashboard/equipe") ? activeLinkClass : inactiveLinkClass}`}
          >
            <Users size={17} strokeWidth={1.7} />
            <span>Clientes & Equipe</span>
          </Link>

          <Link 
            href="/dashboard/sincronizacao" 
            className={`${baseLinkClass} ${isActive("/dashboard/sincronizacao") ? activeLinkClass : inactiveLinkClass}`}
          >
            <FolderOpen size={17} strokeWidth={1.7} />
            <span>Sincronização</span>
          </Link>
        </div>

        {/* Navegação 2: ANÁLISE */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            ANÁLISE
          </p>

          <Link 
            href="/dashboard" 
            className={`${baseLinkClass} ${inactiveLinkClass}`}
          >
            <BarChart3 size={17} strokeWidth={1.7} />
            <span>Relatórios</span>
          </Link>

          <Link 
            href="/dashboard/financeiro" 
            className={`${baseLinkClass} ${isActive("/dashboard/financeiro") ? activeLinkClass : inactiveLinkClass}`}
          >
            <CircleDollarSign size={17} strokeWidth={1.7} />
            <span>Honorários</span>
          </Link>
          
          <Link 
            href="/dashboard/configuracoes" 
            className={`${baseLinkClass} ${inactiveLinkClass}`}
          >
            <Smartphone size={17} strokeWidth={1.7} />
            <span>Versão mobile</span>
          </Link>
        </div>
      </nav>

      {/* Rodapé da Sidebar: Perfil do usuário */}
      <div className="p-3 border-t border-[#F4F5F7] bg-[#FAFAFA] space-y-2">
        <div className="px-2 py-1.5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#DBEAFE] text-[#1E40AF] flex items-center justify-center font-bold text-xs shrink-0">
            PM
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#131822] truncate">Pablo Maciel</p>
            <p className="text-[10px] text-[#9CA3AF] truncate font-medium">1.758 processos</p>
          </div>
        </div>

        <div className="flex items-center gap-1 pt-0.5">
          <Link 
            href="/dashboard/configuracoes" 
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[#6B7280] hover:text-[#131822] hover:bg-[#F4F5F7] rounded-lg transition-colors text-xs font-semibold"
            title="Configurações"
          >
            <Settings size={15} strokeWidth={1.7} />
            <span>Ajustes</span>
          </Link>

          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center p-1.5 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
            title="Encerrar Sessão"
          >
            <LogOut size={15} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </aside>
  );
}
