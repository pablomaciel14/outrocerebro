"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Search, ScanSearch, ChevronRight } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  // Mapeamento dos grupos cognitivos e títulos para o Breadcrumbs
  const getBreadcrumbs = () => {
    if (pathname === "/dashboard") {
      return {
        grupo: "Meu Foco",
        pagina: "Visão Geral",
        subtitulo: "Prazos, acervo e carga da equipe",
      };
    }
    if (pathname.startsWith("/dashboard/tarefas")) {
      return {
        grupo: "Meu Foco",
        pagina: "Pauta de Tarefas",
        subtitulo: "Workflow diário de pendências e cumprimentos",
      };
    }
    if (pathname.startsWith("/dashboard/prazos")) {
      return {
        grupo: "Meu Foco",
        pagina: "Prazos Fatais",
        subtitulo: "Radar de fatalidades e audiências",
      };
    }
    if (pathname.startsWith("/dashboard/processos/")) {
      return {
        grupo: "Meu Acervo",
        pagina: "Processos",
        subtitulo: "Ficha 360° do processo",
      };
    }
    if (pathname.startsWith("/dashboard/processos")) {
      return {
        grupo: "Meu Acervo",
        pagina: "Processos",
        subtitulo: "Base unificada de 3.883 ações",
      };
    }
    if (pathname.startsWith("/dashboard/documentos")) {
      return {
        grupo: "Meu Acervo",
        pagina: "Documentos",
        subtitulo: "Peças, minutas e repositório de arquivos",
      };
    }
    if (pathname.startsWith("/dashboard/equipe")) {
      return {
        grupo: "O Escritório",
        pagina: "Equipe & Clientes",
        subtitulo: "Distribuição de processos e carteiras",
      };
    }
    if (pathname.startsWith("/dashboard/financeiro")) {
      return {
        grupo: "O Escritório",
        pagina: "Honorários",
        subtitulo: "Valores previstos e contingenciamento",
      };
    }
    if (pathname.startsWith("/dashboard/sincronizacao")) {
      return {
        grupo: "Sistema",
        pagina: "Sincronização",
        subtitulo: "Central de integração de planilhas e reconciliação",
      };
    }
    if (pathname.startsWith("/dashboard/configuracoes")) {
      return {
        grupo: "Sistema",
        pagina: "Configurações",
        subtitulo: "Preferências, banco de dados e conexões",
      };
    }

    return {
      grupo: "Outro Cérebro",
      pagina: "Dashboard",
      subtitulo: "Gestão Jurídica Inteligente",
    };
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <header className="h-[68px] flex-shrink-0 bg-white/90 backdrop-blur-md border-b border-[#E7E8EC] px-7 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* 1. Trilha Cognitiva (Breadcrumbs) */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-semibold text-[#9CA3AF] hover:text-[#4B5563] transition-colors">
          Outro Cérebro
        </span>
        <ChevronRight size={13} className="text-[#D1D5DB] shrink-0" />
        <span className="text-xs font-semibold text-[#6B7280]">
          {breadcrumb.grupo}
        </span>
        <ChevronRight size={13} className="text-[#D1D5DB] shrink-0" />
        <h1 className="text-xs sm:text-sm font-bold text-[#131822] tracking-tight whitespace-nowrap truncate">
          {breadcrumb.pagina}
        </h1>
      </div>

      {/* 2. Busca Rápida e Sino de Notificações */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 h-9 px-3 bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl text-[#9CA3AF] text-xs w-48 sm:w-72 focus-within:border-[#2563EB] transition-colors shadow-2xs">
          <Search size={15} strokeWidth={1.8} className="shrink-0" />
          <input
            type="text"
            placeholder="Buscar no meu cérebro…"
            className="w-full bg-transparent border-0 outline-none text-xs text-[#131822] placeholder:text-[#9CA3AF]"
          />
          <span className="w-5 h-5 rounded bg-[#F4F5F7] text-[#6B7280] hidden sm:flex items-center justify-center shrink-0 text-[10px] font-mono">
            /
          </span>
        </div>

        <Link
          href="/dashboard/prazos"
          className="relative h-9 w-9 flex items-center justify-center bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl text-[#4B5563] hover:text-[#131822] hover:bg-[#F9FAFB] transition-colors shadow-2xs"
          title="Prazos vencendo & Notificações"
        >
          <Bell size={17} strokeWidth={1.8} />
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#FAFAF9]">
            3
          </span>
        </Link>
      </div>
    </header>
  );
}

export default Header;
