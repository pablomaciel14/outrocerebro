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
  LogOut, 
  CheckSquare, 
  DatabaseZap
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

  // Efeito "Marcador de Página" (Design do Menu Ativo elegante)
  const linkBase = "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-semibold border-l-4";
  const linkActive = "bg-[#EFF6FF] border-[#2563EB] text-[#1E40AF] font-bold shadow-2xs";
  const linkInactive = "border-transparent text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#131822]";

  return (
    <aside className="w-64 bg-[#FFFFFF] min-h-screen flex flex-col border-r border-[#E7E8EC] shrink-0 sticky top-0 h-screen z-30">
      
      {/* 1. Topo: Logo Outro Cérebro */}
      <div className="h-[68px] flex items-center gap-3 px-6 border-b border-[#F4F5F7]">
        <div className="w-8 h-8 rounded-xl bg-[#0F1420] flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
          <img
            src="/outro-cerebro-symbol.webp"
            alt="Outro Cérebro"
            className="w-5 h-5 object-contain"
          />
        </div>
        <div>
          <div className="text-sm font-bold text-[#131822] tracking-tight leading-tight">
            Outro <span className="text-[#2563EB]">Cérebro</span>
          </div>
          <div className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider">GESTÃO JURÍDICA</div>
        </div>
      </div>

      {/* 2. Navegação por Gavetas Mentais */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        
        {/* GRUPO 1: MEU FOCO (O Agora) */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            MEU FOCO
          </p>
          <Link href="/dashboard" className={`${linkBase} ${isActive("/dashboard") ? linkActive : linkInactive}`}>
            <LayoutDashboard size={17} strokeWidth={1.6} />
            <span>Visão Geral</span>
          </Link>
          <Link href="/dashboard/tarefas" className={`${linkBase} ${isActive("/dashboard/tarefas") ? linkActive : linkInactive}`}>
            <CheckSquare size={17} strokeWidth={1.6} />
            <span className="flex-1">Pauta de Tarefas</span>
          </Link>
          <Link href="/dashboard/prazos" className={`${linkBase} ${isActive("/dashboard/prazos") ? linkActive : linkInactive}`}>
            <CalendarClock size={17} strokeWidth={1.6} />
            <span className="flex-1">Prazos Fatais</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono font-bold bg-[#DC2626] text-white flex items-center justify-center">
              3
            </span>
          </Link>
        </div>

        {/* GRUPO 2: MEU ACERVO (A Base) */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            MEU ACERVO
          </p>
          <Link href="/dashboard/processos" className={`${linkBase} ${isActive("/dashboard/processos") ? linkActive : linkInactive}`}>
            <Scale size={17} strokeWidth={1.6} />
            <span>Processos</span>
          </Link>
          <Link href="/dashboard/documentos" className={`${linkBase} ${isActive("/dashboard/documentos") ? linkActive : linkInactive}`}>
            <FolderOpen size={17} strokeWidth={1.6} />
            <span>Documentos</span>
          </Link>
        </div>

        {/* GRUPO 3: O ESCRITÓRIO (Gestão) */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            O ESCRITÓRIO
          </p>
          <Link href="/dashboard/equipe" className={`${linkBase} ${isActive("/dashboard/equipe") ? linkActive : linkInactive}`}>
            <Users size={17} strokeWidth={1.6} />
            <span>Equipe & Clientes</span>
          </Link>
          <Link href="/dashboard/financeiro" className={`${linkBase} ${isActive("/dashboard/financeiro") ? linkActive : linkInactive}`}>
            <CircleDollarSign size={17} strokeWidth={1.6} />
            <span>Honorários</span>
          </Link>
        </div>

        {/* GRUPO 4: SISTEMA (Sala de Máquinas) */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
            SISTEMA
          </p>
          <Link href="/dashboard/sincronizacao" className={`${linkBase} ${isActive("/dashboard/sincronizacao") ? linkActive : linkInactive}`}>
            <DatabaseZap size={17} strokeWidth={1.6} />
            <span>Sincronização</span>
          </Link>
        </div>

      </nav>

      {/* 3. Rodapé do Usuário & Ações */}
      <div className="p-3 border-t border-[#F4F5F7] bg-[#FAFAFA] space-y-1">
        <Link href="/dashboard/configuracoes" className={`${linkBase} ${isActive("/dashboard/configuracoes") ? linkActive : linkInactive}`}>
          <Settings size={17} strokeWidth={1.6} />
          <span>Configurações</span>
        </Link>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center gap-3 px-3.5 py-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-xl transition-all text-xs font-semibold border-l-4 border-transparent text-left"
        >
          <LogOut size={17} strokeWidth={1.6} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
