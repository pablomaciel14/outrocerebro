import fs from "fs";
import path from "path";
import resumoData from "@/data/resumo.json";

export interface ProcessoCompleto {
  id?: string;
  n: string; // número CNJ
  mat: string; // matéria
  tem: string; // tema
  gru: string; // grupo
  res: string; // responsável
  aca: string; // ação
  jui: string; // juízo
  org: string; // órgão
  aut: string; // autor
  reu: string; // réu
  adv: string; // advogado
  ent: string | null; // data entrada
  aju: string | null; // data ajuizamento
  val: number; // valor
  sta: string; // status
  mei: string; // meio (eletrônico/físico)
}

let cachedProcessos: ProcessoCompleto[] | null = null;

export function getResumoAcervo() {
  return resumoData;
}

export function getAllProcessos(): ProcessoCompleto[] {
  if (cachedProcessos) return cachedProcessos;

  try {
    const filePath = path.join(process.cwd(), "data", "processos.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      cachedProcessos = JSON.parse(fileData) as ProcessoCompleto[];
      return cachedProcessos;
    }
  } catch (error) {
    console.error("Erro ao ler data/processos.json:", error);
  }

  return [];
}

export function getProcessoByNumero(numeroOrId: string): ProcessoCompleto | null {
  const processos = getAllProcessos();
  const decoded = decodeURIComponent(numeroOrId).trim();
  
  return (
    processos.find(
      (p) => p.n === decoded || p.n.replace(/\D/g, "") === decoded.replace(/\D/g, "")
    ) || null
  );
}

export function searchProcessos({
  termo = "",
  materia = "Todas",
  status = "Todos",
  responsavel = "Todos",
  page = 1,
  limit = 50,
}: {
  termo?: string;
  materia?: string;
  status?: string;
  responsavel?: string;
  page?: number;
  limit?: number;
}) {
  let list = getAllProcessos();

  if (termo.trim()) {
    const q = termo.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.n.toLowerCase().includes(q) ||
        p.aut.toLowerCase().includes(q) ||
        p.reu.toLowerCase().includes(q) ||
        p.adv.toLowerCase().includes(q) ||
        p.res.toLowerCase().includes(q) ||
        p.jui.toLowerCase().includes(q)
    );
  }

  if (materia !== "Todas") {
    list = list.filter((p) => p.mat.toLowerCase() === materia.toLowerCase());
  }

  if (status !== "Todos") {
    list = list.filter((p) => p.sta.toLowerCase() === status.toLowerCase());
  }

  if (responsavel !== "Todos") {
    list = list.filter((p) => p.res.toLowerCase().includes(responsavel.toLowerCase()));
  }

  const total = list.length;
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
