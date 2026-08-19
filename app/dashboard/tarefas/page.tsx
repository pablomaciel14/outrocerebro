import React from "react";
import Link from "next/link";
import { CheckSquare, Clock, CheckCircle2, ArrowUpRight, Plus, FolderSync } from "lucide-react";

export default function TarefasPage() {
  const tarefasMock = [
    {
      id: "1",
      evento: "Contestação — Ação Ordinária",
      processo: "0014285-42.2023.8.19.0001",
      fatal: "22/08/2026",
      responsavel: "Pablo Maciel",
      status: "Pendente",
      urgente: true,
    },
    {
      id: "2",
      evento: "Réplica à Contestação",
      processo: "0840769-97.2025.8.23.0010",
      fatal: "25/08/2026",
      responsavel: "Thiago Pires",
      status: "Pendente",
      urgente: false,
    },
    {
      id: "3",
      evento: "Manifestação Laudo Pericial",
      processo: "0834704-52.2026.8.23.0010",
      fatal: "28/08/2026",
      responsavel: "Lucas Pires",
      status: "Pendente",
      urgente: false,
    },
    {
      id: "4",
      evento: "Juntada de Procuração e Guias",
      processo: "0826606-49.2024.8.23.0010",
      fatal: "18/08/2026",
      responsavel: "Pablo Maciel",
      status: "Concluídas",
      urgente: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#131822] tracking-tight flex items-center gap-2.5">
            <CheckSquare className="text-[#16A34A] w-6 h-6" strokeWidth={1.8} />
            <span>Pauta de Tarefas & Atividades</span>
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Organização diária da equipe por prazos, atividades pendentes e tarefas cumpridas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/sincronizacao"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#E7E8EC] hover:bg-[#F9FAFB] text-[#4B5563] shadow-2xs transition-colors"
          >
            <FolderSync size={15} />
            <span>Sincronizar Pauta</span>
          </Link>
        </div>
      </div>

      {/* Grid de Tarefas */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F4F5F7] bg-[#FAFBFD] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#131822]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
            <span>Tarefas Ativas na Semana</span>
          </div>
          <span className="text-[11px] font-mono text-[#6B7280]">
            3 pendentes · 1 concluída
          </span>
        </div>

        <div className="divide-y divide-[#F9FAFB]">
          {tarefasMock.map((t) => (
            <div
              key={t.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFAF9] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.urgente ? "bg-[#DC2626]" : t.status === "Concluídas" ? "bg-[#16A34A]" : "bg-[#2563EB]"}`} />
                  <span className="font-bold text-xs text-[#131822]">{t.evento}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    t.status === "Concluídas" 
                      ? "bg-[#DCFCE7] text-[#166534]" 
                      : t.urgente 
                        ? "bg-[#FEE2E2] text-[#991B1B]" 
                        : "bg-[#DBEAFE] text-[#1E40AF]"
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="text-xs text-[#9CA3AF] font-mono mt-1">
                  Processo: <span className="text-[#4B5563]">{t.processo}</span> · Responsável: <strong className="text-[#374151]">{t.responsavel}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="text-right">
                  <span className="text-[11px] text-[#9CA3AF] block">Data Fatal</span>
                  <strong className={`font-mono ${t.urgente ? "text-[#DC2626]" : "text-[#131822]"}`}>{t.fatal}</strong>
                </div>

                <Link
                  href={`/dashboard/processos/${encodeURIComponent(t.processo)}`}
                  className="p-2 border border-[#E7E8EC] rounded-xl text-[#6B7280] hover:text-[#131822] hover:bg-[#F4F5F7] transition-colors"
                  title="Ver processo"
                >
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
