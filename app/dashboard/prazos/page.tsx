import React from "react";
import { CalendarClock, AlertCircle, Clock, Calendar as CalendarIcon } from "lucide-react";

export default function PrazosPage() {
  const prazos = [
    {
      id: "1",
      titulo: "Contestação - Ação Ordinária Enel",
      processo: "0014285-42.2023.8.19.0001",
      dataLimite: "22/08/2026",
      responsavel: "Pablo Maciel",
      diasRestantes: 3,
      urgencia: "alta",
    },
    {
      id: "2",
      titulo: "Réplica à Contestação Santander",
      processo: "0803192-11.2022.8.19.0002",
      dataLimite: "28/08/2026",
      responsavel: "Thiago Pires",
      diasRestantes: 9,
      urgencia: "media",
    },
    {
      id: "3",
      titulo: "Manifestação sobre Laudo Pericial",
      processo: "5002144-88.2024.4.02.5101",
      dataLimite: "05/09/2026",
      responsavel: "Lucas Pires",
      diasRestantes: 17,
      urgencia: "normal",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
          <CalendarClock className="text-[#2563EB] w-8 h-8" strokeWidth={1.5} />
          Agenda & Prazos Fatais
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Controle centralizado de publicações, intimações e prazos processuais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">Urgentes (&le; 3 dias)</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-2">1</p>
          <p className="text-xs text-[#6B7280] mt-1">Ação prioritária</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#854D0E] uppercase tracking-wider">Esta Semana</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-2">4</p>
          <p className="text-xs text-[#6B7280] mt-1">Prazos em contagem</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-6 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-[#166534] uppercase tracking-wider">Próximos 15 Dias</p>
          <p className="text-3xl font-bold text-[#1F2937] mt-2">12</p>
          <p className="text-xs text-[#6B7280] mt-1">Em elaboração pela equipe</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1F2937]">Próximos Vencimentos</h2>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {prazos.map((item) => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F9FAFB] transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    item.urgencia === "alta" 
                      ? "bg-[#FEE2E2] text-[#991B1B]" 
                      : item.urgencia === "media" 
                      ? "bg-[#FEF9C3] text-[#854D0E]" 
                      : "bg-[#DBEAFE] text-[#1E40AF]"
                  }`}>
                    {item.diasRestantes} dias restantes
                  </span>
                  <span className="text-xs font-mono text-[#6B7280]">{item.processo}</span>
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">{item.titulo}</h3>
                <p className="text-xs text-[#6B7280]">Responsável: {item.responsavel}</p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-xs font-bold text-[#1F2937] flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#2563EB]" strokeWidth={1.5} />
                    {item.dataLimite}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
