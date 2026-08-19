"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import processosData from "@/data/processos.json";
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Download,
  FolderOpen
} from "lucide-react";

export default function ProcessosPage() {
  const [busca, setBusca] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 50;

  // Filtragem ultra-rápida no cliente com useMemo sobre os 3.883 processos
  const processosFiltrados = useMemo(() => {
    let list = processosData;

    if (busca.trim()) {
      const q = busca.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.n.toLowerCase().includes(q) ||
          p.aut.toLowerCase().includes(q) ||
          p.reu.toLowerCase().includes(q) ||
          p.res.toLowerCase().includes(q) ||
          p.adv.toLowerCase().includes(q) ||
          p.jui.toLowerCase().includes(q)
      );
    }

    if (filtroMateria !== "Todas") {
      list = list.filter((p) => p.mat.toLowerCase() === filtroMateria.toLowerCase());
    }

    if (filtroStatus !== "Todos") {
      list = list.filter((p) => p.sta.toLowerCase() === filtroStatus.toLowerCase());
    }

    if (filtroResponsavel !== "Todos") {
      list = list.filter((p) => p.res.toLowerCase().includes(filtroResponsavel.toLowerCase()));
    }

    return list;
  }, [busca, filtroMateria, filtroStatus, filtroResponsavel]);

  const total = processosFiltrados.length;
  const totalPaginas = Math.ceil(total / itensPorPagina) || 1;
  const inicio = (pagina - 1) * itensPorPagina;
  const itensExibidos = processosFiltrados.slice(inicio, inicio + itensPorPagina);

  const formatarMoeda = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(e.target.value);
    setPagina(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#131822] tracking-tight">Acervo de Processos</h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Total de <span className="font-bold text-[#131822]">{processosData.length.toLocaleString("pt-BR")}</span> ações cadastradas na base
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-[#FFFFFF] border border-[#E7E8EC] px-3 py-1.5 rounded-lg text-[#6B7280]">
            Exibindo {itensExibidos.length} de {total.toLocaleString("pt-BR")} filtrados
          </span>
        </div>
      </div>

      {/* Barra de Filtros & Busca */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Campo de Busca */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={16} />
            <input
              type="text"
              placeholder="Buscar por número CNJ, autor, réu, advogado ou comarca..."
              value={busca}
              onChange={handleBuscaChange}
              className="w-full pl-9 pr-4 py-2 bg-[#FAFAF9] border border-[#E7E8EC] rounded-lg text-xs text-[#131822] focus:outline-none focus:border-[#2563EB] transition-colors"
            />
          </div>

          {/* Select de Matéria */}
          <select
            value={filtroMateria}
            onChange={(e) => { setFiltroMateria(e.target.value); setPagina(1); }}
            className="w-full md:w-44 px-3 py-2 bg-[#FAFAF9] border border-[#E7E8EC] rounded-lg text-xs text-[#131822] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="Todas">Todas as matérias</option>
            <option value="Cível">Cível (3.518)</option>
            <option value="Eleitoral">Eleitoral (153)</option>
            <option value="Trabalhista">Trabalhista (73)</option>
            <option value="Criminal">Criminal (39)</option>
            <option value="Família e Sucessões">Família e Sucessões (29)</option>
            <option value="Administrativo">Administrativo (24)</option>
          </select>

          {/* Select de Responsável */}
          <select
            value={filtroResponsavel}
            onChange={(e) => { setFiltroResponsavel(e.target.value); setPagina(1); }}
            className="w-full md:w-52 px-3 py-2 bg-[#FAFAF9] border border-[#E7E8EC] rounded-lg text-xs text-[#131822] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="Todos">Todos os responsáveis</option>
            <option value="Pablo Ramon">Pablo Ramon (1.757)</option>
            <option value="Thiago Pires">Thiago Pires (963)</option>
            <option value="Lucas Pires">Lucas Pires (415)</option>
            <option value="João Vitor">João Vitor (367)</option>
            <option value="Wagner Vinícius">Wagner Vinícius (135)</option>
            <option value="Janderson André">Janderson André (77)</option>
            <option value="Régis Lews">Régis Lews (69)</option>
          </select>

          {/* Select de Status */}
          <select
            value={filtroStatus}
            onChange={(e) => { setFiltroStatus(e.target.value); setPagina(1); }}
            className="w-full md:w-40 px-3 py-2 bg-[#FAFAF9] border border-[#E7E8EC] rounded-lg text-xs text-[#131822] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="Todos">Todos os status</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Sentença favorável">Sentença favorável</option>
          </select>
        </div>
      </div>

      {/* Tabela de Processos */}
      <div className="bg-[#FFFFFF] border border-[#E7E8EC] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E7E8EC] text-[#6B7280] font-semibold">
                <th className="py-3 px-4">Número do Processo</th>
                <th className="py-3 px-4">Autor / Polo Ativo</th>
                <th className="py-3 px-4">Réu / Polo Passivo</th>
                <th className="py-3 px-4">Matéria / Comarca</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4">Valor da Causa</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {itensExibidos.length > 0 ? (
                itensExibidos.map((proc) => (
                  <tr key={proc.n} className="hover:bg-[#FAFAF9] transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-[#131822]">
                      <Link
                        href={`/dashboard/processos/${encodeURIComponent(proc.n)}`}
                        className="hover:text-[#2563EB] hover:underline"
                      >
                        {proc.n}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#374151] max-w-[160px] truncate" title={proc.aut}>
                      {proc.aut || "—"}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] max-w-[160px] truncate" title={proc.reu}>
                      {proc.reu || "—"}
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">
                      <span className="font-semibold text-[#374151]">{proc.mat}</span>
                      <span className="text-[#9CA3AF] block text-[11px]">{proc.jui || "Boa Vista/RR"}</span>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280]">
                      {proc.res}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#374151]">
                      {proc.val ? formatarMoeda(proc.val) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proc.sta === "Em andamento" 
                          ? "bg-[#DBEAFE] text-[#1E40AF]" 
                          : "bg-[#DCFCE7] text-[#166534]"
                      }`}>
                        {proc.sta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/processos/${encodeURIComponent(proc.n)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFFFFF] border border-[#E7E8EC] hover:bg-[#F4F5F7] text-[#2563EB] rounded text-xs font-semibold transition-colors"
                      >
                        <span>Abrir</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#9CA3AF]">
                    Nenhum processo localizado para os filtros informados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé de Paginação */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#F9FAFB] border-t border-[#E7E8EC] text-xs text-[#6B7280]">
          <div>
            Página <span className="font-bold text-[#131822]">{pagina}</span> de{" "}
            <span className="font-bold text-[#131822]">{totalPaginas}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPagina((p) => Math.max(p - 1, 1))}
              disabled={pagina <= 1}
              className="p-1.5 rounded border border-[#E7E8EC] bg-[#FFFFFF] hover:bg-[#F4F5F7] disabled:opacity-40 disabled:cursor-not-allowed text-[#374151]"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 font-mono font-bold text-[#131822]">{pagina}</span>

            <button
              onClick={() => setPagina((p) => Math.min(p + 1, totalPaginas))}
              disabled={pagina >= totalPaginas}
              className="p-1.5 rounded border border-[#E7E8EC] bg-[#FFFFFF] hover:bg-[#F4F5F7] disabled:opacity-40 disabled:cursor-not-allowed text-[#374151]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
