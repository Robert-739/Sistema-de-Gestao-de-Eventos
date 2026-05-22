"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Simulando o ID do aluno logado como 2 por enquanto (mude para um ID de aluno que exista no seu banco)
const ID_ALUNO_LOGADO = 2 

export async function inscreverNoEvento(idEvento: number) {
  try {
    // 1. Verifica se o evento existe e se ainda tem vagas
    const evento = await prisma.eventos.findUnique({
      where: { id_evento: idEvento },
      include: { _count: { select: { inscricoes: true } } }
    })

    if (!evento) return { error: "Evento não encontrado." }
    
    if (evento._count.inscricoes >= evento.vagas_limite) {
      return { error: "Infelizmente as vagas para este evento já esgotaram!" }
    }

    // 2. Cria a inscrição no banco
    await prisma.inscricoes.create({
      data: {
        id_aluno: ID_ALUNO_LOGADO,
        id_evento: idEvento,
        presenca_entrada: false,
        presenca_saida: false
      }
    })

    revalidatePath("/dashboard/aluno")
    return { success: "Inscrição realizada com sucesso! Seu ingresso foi gerado." }

  } catch (error: unknown) {
    console.error("Erro ao inscrever:", error)

    // Verifica se o erro é um objeto e possui a propriedade 'code' (padrão do Prisma)
    if (
      error && 
      typeof error === "object" && 
      "code" in error && 
      error.code === "P2002"
    ) {
      return { error: "Você já está inscrito neste evento!" }
    }

    return { error: "Erro interno ao processar inscrição." }
  }
}

export async function cancelarInscricao(idInscricao: number) {
  try {
    await prisma.inscricoes.delete({
      where: { id_inscricao: idInscricao }
    })

    revalidatePath("/dashboard/aluno")
    return { success: "Inscrição cancelada com sucesso." }
  } catch (error) {
    console.error("Erro ao cancelar:", error)
    return { error: "Erro ao cancelar inscrição." }
  }
}