"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function buscarEventoPorId(idEvento: number) {
  return await prisma.eventos.findUnique({
    where: { id_evento: idEvento },
  })
}

export async function atualizarEventoAction(formData: FormData) {
  const idEvento = Number(formData.get("id_evento"))
  const titulo = formData.get("titulo") as string
  const descricao = formData.get("descricao") as string
  const palestrante = formData.get("palestrante") as string
  const dataInicioStr = formData.get("data_inicio") as string
  const dataFimStr = formData.get("data_fim") as string
  const vagasLimite = Number(formData.get("vagas_limite"))
  const cargaHoraria = Number(formData.get("carga_horaria"))

  await prisma.eventos.update({
    where: { id_evento: idEvento },
    data: {
      titulo,
      descricao,
      palestrante,
      data_inicio: new Date(dataInicioStr),
      data_fim: new Date(dataFimStr),
      vagas_limite: vagasLimite,
      carga_horaria: cargaHoraria,
    },
  })

  revalidatePath("/dashboard/coordenador")
}

export async function excluirEventoAction(idEvento: number) {
  // Remove inscrições atreladas primeiro
  await prisma.inscricoes.deleteMany({
    where: { id_evento: idEvento }
  })

  // Deleta o evento
  await prisma.eventos.delete({
    where: { id_evento: idEvento }
  })

  revalidatePath("/dashboard/coordenador")
}