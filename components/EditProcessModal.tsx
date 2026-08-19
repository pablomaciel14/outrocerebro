"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { X, Save, Loader2, Edit3 } from "lucide-react";

interface EditModalProps {
  processoId: string;
  statusAtual: string;
  valorAtual: number;
}

export function EditProcessModal({ processoId, statusAtual, valorAtual }: EditModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [status, setStatus] = useState(statusAtual);
  const [valor, setValor] = useState(valorAtual);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const client = getSupabaseClient();

    if (client) {
      try {
        const { error } = await client
          .from("processos")
          .update({
            status_resultado: status,
            valor_causa: Number(valor),
          })
          .eq("id", processoId);

        if (error) {
          throw new Error(error.message);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setFeedback("Erro ao atualizar no banco: " + msg);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      {/* Botão que aciona o Modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-[#1F2937] hover:bg-[#111827] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Editar Dados</span>
      </button>

      {/* Estrutura do Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center p-6 border-b border-[#E5E7EB] bg-[#FAFAFA]">
              <div>
                <h3 className="text-base font-bold text-[#1F2937]">Atualizar Processo</h3>
                <p className="text-xs text-[#6B7280]">Ajuste o status e o valor da causa</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#9CA3AF] hover:text-[#1F2937] p-1.5 rounded-lg hover:bg-[#E5E7EB] transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulário */}
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {feedback && (
                <div className="p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#991B1B] text-xs font-medium">
                  {feedback}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">
                  Status do Processo
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:border-[#2563EB] font-medium cursor-pointer"
                >
                  <option value="Em andamento">Em andamento</option>
                  <option value="Sentença favorável">Sentença favorável</option>
                  <option value="Arquivado">Arquivado</option>
                  <option value="Suspenso">Suspenso</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">
                  Valor da Causa (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:border-[#2563EB] font-medium"
                  required
                />
              </div>

              {/* Botões Inferiores */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
