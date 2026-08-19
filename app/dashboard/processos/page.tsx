"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  FileSearch, 
  Scale, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  Plus
} from "lucide-react";

interface Processo {
  id: string;
  numero_processo: string;
  autor: string;
  reu: string;
  materia: string;
  status_resultado: string;
  responsavel: string;
  valor_causa: number;
}

const PROCESSOS_AUDITORIA: Processo[] = [
  {
    id: "1",
    numero_processo: "0014285-42.2023.8.19.0001",
    autor: "Âmbar Energia S.A.",
    reu: "Concessionária Enel Distribuição Rio",
    materia: "Cível",
    status_resultado: "Em andamento",
    responsavel: "Pablo Maciel",
    valor_causa: 450000.0,
  },
  {
    id: "2",
    numero_processo: "0803192-11.2022.8.19.0002",
    autor: "Particular / Consumidor",
    reu: "Banco Santander Brasil S.A.",
    materia: "Cível",
    status_resultado: "Sentença favorável",
    responsavel: "Thiago Pires",
    valor_causa: 32000.0,
  },
  {
    id: "3",
    numero_processo: "5002144-88.2024.4.02.5101",
    autor: "Particular / Tributário",
    reu: "União Federal - Fazenda Nacional",
    materia: "Administrativo",
    status_resultado: "Em andamento",
    responsavel: "Lucas Pires",
    valor_causa: 125000.0,
  },
  {
    id: "4",
    numero_processo: "0100452-78.2021.5.01.0014",
    autor: "Ex-colaborador",
    reu: "Sociedade Empresária de Energia",
    materia: "Trabalhista",
    status_resultado: "Sentença favorável",
    responsavel: "João Vitor",
    valor_causa: 78500.0,
  },
  {
    id: "5",
    numero_processo: "0600124-90.2024.6.19.0000",
    autor: "Coligação Partidária",
    reu: "Candidato Opositor",
    materia: "Eleitoral",
    status_resultado: "Em andamento",
    responsavel: "Pablo Maciel",
    valor_causa: 0.0,
  },
  {
    id: "6",
    numero_processo: "0029841-15.2023.8.19.0001",
    autor: "Âmbar Energia S.A.",
    reu: "Município do Rio de Janeiro",
    materia: "Cível",
    status_resultado: "Em andamento",
    responsavel: "Pablo Maciel",
    valor_causa: 890000.0,
  },
];

export default function ProcessosPage() {
  const router = useRouter();
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const itensPorPagina = 50;

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroMateria, filtroStatus]);

  const carregarProcessos = useCallback(async () => {
    setLoading(true);
    const client = getSupabaseClient();
    const from = (paginaAtual - 1) * itensPorPagina;
    const to = from + itensPorPagina - 1;

    if (client) {
      try {
        let query = client
          .from("processos")
          .select("id, numero_processo, autor, reu, materia, status_resultado, responsavel, valor_causa", {
            count: "exact",
          })
          .order("data_entrada", { ascending: false })
          .range(from, to);

        if (busca.trim()) {
          query = query.or(`numero_processo.ilike.%${busca.trim()}%,autor.ilike.%${busca.trim()}%`);
        }

        if (filtroMateria !== "Todas") {
          query = query.eq("materia", filtroMateria);
        }

        if (filtroStatus !== "Todos") {
          query = query.eq("status_resultado", filtroStatus);
        }

        const { data, count, error } = await query;

        if (!error && data && data.length > 0) {
          setProcessos(data as Processo[]);
          if (typeof count === "number") setTotalRegistros(count);
          setIsLive(true);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback local
      }
    }

    let filtrados = [...PROCESSOS_AUDITORIA];

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.numero_processo.toLowerCase().includes(termo) ||
          p.autor.toLowerCase().includes(termo) ||
          p.reu.toLowerCase().includes(termo)
      );
    }

    if (filtroMateria !== "Todas") {
      filtrados = filtrados.filter((p) => p.materia.toLowerCase() === filtroMateria.toLowerCase());
    }

    if (filtroStatus !== "Todos") {
      filtrados = filtrados.filter((p) => p.status_resultado.toLowerCase() === filtroStatus.toLowerCase());
    }

    setTotalRegistros(filtrados.length);
    const paginados = filtrados.slice(from, to + 1);
    setProcessos(paginados);
    setIsLive(false);
    setLoading(false);
  }, [busca, filtroMateria, filtroStatus, paginaAtual]);

  useEffect(() => {
    carregarProcessos();
  }, [carregarProcessos]);

  const totalPaginas = Math.ceil(totalRegistros / itensPorPagina);
  const inicioRegistro = totalRegistros > 0 ? (paginaAtual - 1) * itensPorPagina + 1 : 0;
  const fimRegistro = Math.min(paginaAtual * itensPorPagina, totalRegistros);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
            <Scale className="text-[#2563EB] w-8 h-8" />
            Acervo de Processos
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Gerencie e filtre as demandas judiciais e extrajudiciais do escritório.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => carregarProcessos()}
            className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F9FAFB] transition-colors shadow-2xs"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Novo Processo
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-4 rounded-2xl flex flex-col md:flex-row gap-4 shadow-xs">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por número do processo ou autor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2563EB] focus:bg-[#FFFFFF] transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex items-center">
            <Filter className="absolute left-3 text-[#9CA3AF] w-3.5 h-3.5 pointer-events-none" />
            <select
              value={filtroMateria}
              onChange={(e) => setFiltroMateria(e.target.value)}
              className="pl-8 pr-8 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#1F2937] focus:outline-none focus:border-[#2563EB] cursor-pointer font-medium"
            >
              <option value="Todas">Todas as Matérias</option>
              <option value="Cível">Cível</option>
              <option value="Eleitoral">Eleitoral</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-xs sm:text-sm text-[#1F2937] focus:outline-none focus:border-[#2563EB] cursor-pointer font-medium"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Sentença favorável">Sentença favorável</option>
          </select>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1F2937] text-[#E5E7EB] text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Número do Processo</th>
                <th className="px-6 py-4 font-semibold">Partes</th>
                <th className="px-6 py-4 font-semibold">Responsável</th>
                <th className="px-6 py-4 font-semibold">Matéria</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[#6B7280]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileSearch className="animate-pulse text-[#2563EB] w-8 h-8" />
                      <span className="text-sm font-medium">Carregando processos...</span>
                    </div>
                  </td>
                </tr>
              ) : processos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-[#6B7280] font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-[#9CA3AF]" />
                      <span>Nenhum processo encontrado com estes filtros.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                processos.map((proc) => (
                  <tr 
                    key={proc.id} 
                    onClick={() => router.push(`/dashboard/processos/${proc.id}`)}
                    className="hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-sm text-[#1F2937] group-hover:text-[#2563EB] transition-colors">
                        {proc.numero_processo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1F2937] truncate max-w-xs">
                        {proc.autor || "—"}
                      </div>
                      <div className="text-xs text-[#6B7280] truncate max-w-xs mt-0.5">
                        {proc.reu ? `x ${proc.reu}` : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-[#4B5563]">{proc.responsavel || "—"}</td>
                    <td className="px-6 py-4 text-xs text-[#6B7280]">{proc.materia || "Cível"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          proc.status_resultado?.toLowerCase().includes("favorável")
                            ? "bg-[#DCFCE7] text-[#166534]"
                            : proc.status_resultado?.toLowerCase().includes("andamento")
                            ? "bg-[#DBEAFE] text-[#1E40AF]"
                            : "bg-[#FEF9C3] text-[#854D0E]"
                        }`}
                      >
                        {proc.status_resultado || "Em andamento"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Paginação Server-Side */}
        <div className="bg-[#FAFAFA] border-t border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-[#6B7280] font-medium">
            Mostrando <span className="font-bold text-[#1F2937]">{inicioRegistro}</span> a{" "}
            <span className="font-bold text-[#1F2937]">{fimRegistro}</span> de{" "}
            <span className="font-bold text-[#1F2937]">{totalRegistros.toLocaleString("pt-BR")}</span> registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
              disabled={paginaAtual === 1 || loading}
              className="p-2 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#4B5563] hover:text-[#2563EB] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] disabled:cursor-not-allowed transition-colors"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs text-[#4B5563] font-medium px-3">
              Página <span className="text-[#2563EB] font-bold">{paginaAtual}</span> de{" "}
              <span>{totalPaginas || 1}</span>
            </span>

            <button
              onClick={() => setPaginaAtual((prev) => Math.min(prev + 1, totalPaginas))}
              disabled={paginaAtual === totalPaginas || totalPaginas === 0 || loading}
              className="p-2 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#4B5563] hover:text-[#2563EB] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] disabled:cursor-not-allowed transition-colors"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
