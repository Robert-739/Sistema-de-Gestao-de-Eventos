"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

async function obterIdAluno(): Promise<number> {
  const cookieStore = await cookies()
  const idDoCookie = cookieStore.get("usuario_id")?.value
  if (!idDoCookie) redirect("/login")
  return Number(idDoCookie)
}

export async function inscreverNoEvento(idEvento: number) {
  try {
    const idAlunoLogado = await obterIdAluno()

    const evento = await prisma.eventos.findUnique({
      where: { id_evento: idEvento },
      include: { _count: { select: { inscricoes: true } } }
    })

    if (!evento) return { error: "Evento não encontrado." }

    if (evento._count.inscricoes >= evento.vagas_limite) {
      return { error: "Infelizmente as vagas para este evento já esgotaram!" }
    }

    await prisma.inscricoes.create({
      data: {
        id_aluno: idAlunoLogado,
        id_evento: idEvento,
        presenca_entrada: false,
        presenca_saida: false
      }
    })

    revalidatePath("/dashboard/aluno")
    return { success: "Inscrição realizada com sucesso! Seu ingresso foi gerado." }

  } catch (error: unknown) {
    console.error("Erro ao inscrever:", error)

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
    const idAlunoLogado = await obterIdAluno()

    // Verifica se a inscrição pertence ao aluno logado antes de deletar
    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricao }
    })

    if (!inscricao || inscricao.id_aluno !== idAlunoLogado) {
      return { error: "Inscrição não encontrada ou sem permissão." }
    }

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
