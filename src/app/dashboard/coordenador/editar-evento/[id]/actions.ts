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
  const titulo = (formData.get("titulo") as string)?.trim()
  const descricao = (formData.get("descricao") as string)?.trim()
  const palestrante = (formData.get("palestrante") as string)?.trim()
  const dataInicioStr = formData.get("data_inicio") as string
  const dataFimStr = formData.get("data_fim") as string
  const vagasLimite = Number(formData.get("vagas_limite"))
  const cargaHoraria = Number(formData.get("carga_horaria"))

  // --- VALIDAÇÃO SERVER-SIDE ---
  if (!titulo || !descricao || !palestrante || !dataInicioStr || !dataFimStr) {
    throw new Error("Preencha todos os campos obrigatórios.")
  }

  if (titulo.length < 3) {
    throw new Error("O título deve ter no mínimo 3 caracteres.")
  }

  if (isNaN(vagasLimite) || vagasLimite < 1 || !Number.isInteger(vagasLimite)) {
    throw new Error("Número de vagas inválido. Mínimo: 1 vaga inteira.")
  }

  if (isNaN(cargaHoraria) || cargaHoraria < 1 || !Number.isInteger(cargaHoraria)) {
    throw new Error("Carga horária inválida. Mínimo: 1 hora inteira.")
  }

  const dataInicio = new Date(dataInicioStr)
  const dataFim = new Date(dataFimStr)

  if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
    throw new Error("Datas inválidas.")
  }

  if (dataFim <= dataInicio) {
    throw new Error("A data de término deve ser posterior à data de início.")
  }

  // Verifica se o evento tem inscrições com mais alunos do que as novas vagas
  const inscricoesAtivas = await prisma.inscricoes.count({
    where: { id_evento: idEvento }
  })

  if (vagasLimite < inscricoesAtivas) {
    throw new Error(
      `Não é possível reduzir para ${vagasLimite} vagas. Já existem ${inscricoesAtivas} alunos inscritos neste evento.`
    )
  }
  // --- FIM DA VALIDAÇÃO ---

  await prisma.eventos.update({
    where: { id_evento: idEvento },
    data: {
      titulo,
      descricao,
      palestrante,
      data_inicio: dataInicio,
      data_fim: dataFim,
      vagas_limite: vagasLimite,
      carga_horaria: cargaHoraria,
    },
  })

  revalidatePath("/dashboard/coordenador")
}

export async function excluirEventoAction(idEvento: number) {
  // Remove inscrições atreladas primeiro para não violar a foreign key
  await prisma.inscricoes.deleteMany({
    where: { id_evento: idEvento }
  })

  await prisma.eventos.delete({
    where: { id_evento: idEvento }
  })

  revalidatePath("/dashboard/coordenador")
}
