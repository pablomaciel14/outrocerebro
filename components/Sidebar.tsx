"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Scale, 
  CalendarClock, 
  FolderOpen,
  CircleDollarSign,
  Users, 
  Settings, 
  LogOut 
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

  const baseLinkClass = "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-150 text-sm";
  const activeLinkClass = "bg-[#DBEAFE] text-[#1E40AF] font-semibold border border-[#BFDBFE]";
  const inactiveLinkClass = "text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#1F2937] font-medium";

  return (
    <aside className="w-64 bg-[#FFFFFF] min-h-screen flex flex-col border-r border-[#E5E7EB] shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#E5E7EB]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB]">
            <Scale size={18} strokeWidth={1.5} />
          </div>
          <h1 className="text-lg font-bold text-[#1F2937] tracking-tight">
            Outro <span className="text-[#2563EB]">Cérebro</span>
          </h1>
        </Link>
      </div>

      {/* Navegação de Módulos */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
          Módulos
        </p>
        
        <Link 
          href="/dashboard" 
          className={`${baseLinkClass} ${isActive("/dashboard") ? activeLinkClass : inactiveLinkClass}`}
        >
          <LayoutDashboard size={18} strokeWidth={1.5} />
          <span>Visão Geral</span>
        </Link>
        
        <Link 
          href="/dashboard/processos" 
          className={`${baseLinkClass} ${isActive("/dashboard/processos") ? activeLinkClass : inactiveLinkClass}`}
        >
          <Scale size={18} strokeWidth={1.5} />
          <span>Processos</span>
        </Link>

        <Link 
          href="/dashboard/prazos" 
          className={`${baseLinkClass} ${isActive("/dashboard/prazos") ? activeLinkClass : inactiveLinkClass}`}
        >
          <CalendarClock size={18} strokeWidth={1.5} />
          <span>Agenda & Prazos</span>
        </Link>

        <Link 
          href="/dashboard/documentos" 
          className={`${baseLinkClass} ${isActive("/dashboard/documentos") ? activeLinkClass : inactiveLinkClass}`}
        >
          <FolderOpen size={18} strokeWidth={1.5} />
          <span>Documentos</span>
        </Link>

        <Link 
          href="/dashboard/financeiro" 
          className={`${baseLinkClass} ${isActive("/dashboard/financeiro") ? activeLinkClass : inactiveLinkClass}`}
        >
          <CircleDollarSign size={18} strokeWidth={1.5} />
          <span>Honorários</span>
        </Link>
        
        <Link 
          href="/dashboard/equipe" 
          className={`${baseLinkClass} ${isActive("/dashboard/equipe") ? activeLinkClass : inactiveLinkClass}`}
        >
          <Users size={18} strokeWidth={1.5} />
          <span>Equipe & Clientes</span>
        </Link>
      </nav>

      {/* Rodapé / Configurações e Logout */}
      <div className="p-3 border-t border-[#E5E7EB] bg-[#FAFAFA] space-y-1">
        <div className="px-3 py-2 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#E5E7EB] text-[#1F2937] flex items-center justify-center font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#1F2937] truncate">{displayName}</p>
            <p className="text-[10px] text-[#6B7280] truncate">{email}</p>
          </div>
        </div>

        <Link 
          href="/dashboard/configuracoes" 
          className={`${baseLinkClass} ${isActive("/dashboard/configuracoes") ? activeLinkClass : inactiveLinkClass}`}
        >
          <Settings size={18} strokeWidth={1.5} />
          <span>Configurações</span>
        </Link>
        
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-4 py-2 text-[#DC2626] hover:bg-[#FEE2E2] hover:text-[#991B1B] rounded-xl transition-all text-xs font-semibold"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
