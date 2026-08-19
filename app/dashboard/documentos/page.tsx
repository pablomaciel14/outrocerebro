import React from "react";
import { FolderOpen, FileText, Upload, Plus } from "lucide-react";

export default function DocumentosPage() {
  const documentos = [
    { id: "1", nome: "Modelo_Contestacao_Consumidor.docx", categoria: "Peças Processuais", data: "15/08/2026", tamanho: "45 KB" },
    { id: "2", nome: "Procuracao_Ad_Judicia_Padrao.pdf", categoria: "Modelos Contratuais", data: "10/08/2026", tamanho: "128 KB" },
    { id: "3", nome: "Planilha_Calculo_Honorarios_2026.xlsx", categoria: "Financeiro", data: "08/08/2026", tamanho: "85 KB" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
            <FolderOpen className="text-[#2563EB] w-8 h-8" strokeWidth={1.5} />
            Repositório de Documentos & Peças
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Modelos de peças, procurações, contratos e documentos probatórios.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
          <Upload className="w-4 h-4" strokeWidth={1.5} />
          Enviar Documento
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#E5E7EB]">
          <h2 className="text-base font-bold text-[#1F2937]">Arquivos Recentes</h2>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {documentos.map((doc) => (
            <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-[#DBEAFE] text-[#2563EB] rounded-xl border border-[#BFDBFE]">
                  <FileText className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2937]">{doc.nome}</h3>
                  <p className="text-xs text-[#6B7280]">{doc.categoria} • {doc.tamanho}</p>
                </div>
              </div>
              <span className="text-xs text-[#6B7280] font-medium">{doc.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
