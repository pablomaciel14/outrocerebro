import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CaseItem {
  numero_processo: string;
  autor?: string;
  materia?: string;
  status_resultado?: string;
}

interface RecentCasesProps {
  cases: CaseItem[];
}

export function RecentCases({ cases }: RecentCasesProps) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1F2937]">Movimentações Recentes</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Últimos processos sincronizados no acervo</p>
          </div>
          <Link
            href="/dashboard/processos"
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
          >
            Ver todos
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase tracking-wider border-b border-[#E5E7EB]">
                <th className="px-6 py-3.5 font-semibold">Processo</th>
                <th className="px-6 py-3.5 font-semibold">Parte / Autor</th>
                <th className="px-6 py-3.5 font-semibold">Matéria</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-sm">
              {cases.map((item, idx) => (
                <tr key={item.numero_processo || idx} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#1F2937] font-mono text-xs">
                    {item.numero_processo}
                  </td>
                  <td className="px-6 py-4 text-[#4B5563] text-xs font-medium">{item.autor || "—"}</td>
                  <td className="px-6 py-4 text-[#6B7280] text-xs">{item.materia || "Cível"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status_resultado?.toLowerCase().includes("favorável")
                          ? "bg-[#DCFCE7] text-[#166534]"
                          : item.status_resultado?.toLowerCase().includes("andamento")
                          ? "bg-[#DBEAFE] text-[#1E40AF]"
                          : "bg-[#FEF9C3] text-[#854D0E]"
                      }`}
                    >
                      {item.status_resultado || "Em andamento"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
