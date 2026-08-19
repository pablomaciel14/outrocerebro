"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface RiscoData {
  name: string;
  value: number;
}

export function GraficoRisco({ data }: { data: RiscoData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cores Funcionais (Legal Design)
  // Verde (Seguro/Remoto), Amarelo (Atenção/Possível), Vermelho (Perigo/Provável), Cinza (Não avaliado)
  const CORES: Record<string, string> = {
    "REMOTA": "#10B981",       // Emerald 500
    "POSSÍVEL": "#F59E0B",     // Amber 500
    "POSSIVEL": "#F59E0B",
    "PROVÁVEL": "#EF4444",     // Red 500
    "PROVAVEL": "#EF4444",
    "NÃO AVALIADO": "#9CA3AF", // Gray 400
    "NAO AVALIADO": "#9CA3AF",
  };

  const total = (data || []).reduce((acc, curr) => acc + curr.value, 0);

  if (!mounted) {
    return (
      <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-xs border border-[#E7E8EC] h-[360px] flex items-center justify-center">
        <div className="animate-pulse text-xs text-[#9CA3AF]">Carregando gráfico de prognóstico...</div>
      </div>
    );
  }

  // Se não houver dados, mostra um estado vazio elegante
  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-xs border border-[#E7E8EC] h-[360px] flex flex-col items-center justify-center text-center text-[#6B7280]">
        <div className="w-12 h-12 rounded-full bg-[#F4F5F7] text-[#9CA3AF] flex items-center justify-center mb-3 text-lg font-bold">
          %
        </div>
        <h4 className="text-sm font-bold text-[#131822]">Prognóstico de Risco (Âmbar)</h4>
        <p className="text-xs text-[#9CA3AF] mt-1 max-w-xs">
          Faça a sincronização do Relatório da Âmbar em Configurações para carregar o gráfico.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-2xl shadow-xs border border-[#E7E8EC] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-[#F4F5F7] pb-3">
        <div>
          <h3 className="text-base font-bold text-[#131822] tracking-tight">Prognóstico de Risco (Âmbar)</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">Exposição e contingenciamento contencioso</p>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#F4F5F7] text-[#4B5563] rounded-md">
          {total.toLocaleString("pt-BR")} casos
        </span>
      </div>
      
      <div className="flex-1 min-h-[240px] w-full">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => {
                const normalized = entry.name.toUpperCase().trim();
                const cor = CORES[normalized] || CORES["NÃO AVALIADO"];
                return <Cell key={`cell-${index}`} fill={cor} />;
              })}
            </Pie>
            <Tooltip 
              formatter={(value: any) => [`${Number(value).toLocaleString("pt-BR")} processos`, "Volume"]}
              contentStyle={{ 
                borderRadius: "12px", 
                border: "1px solid #E7E8EC", 
                backgroundColor: "#FFFFFF",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontWeight: 600
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", fontWeight: 600, color: "#4B5563", paddingTop: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default GraficoRisco;
