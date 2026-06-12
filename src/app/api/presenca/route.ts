import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const usuarioId = cookieStore.get("usuario_id")?.value
    if (!usuarioId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    const body = await request.json()
    const { idInscricao, tipoPresenca } = body

    if (!idInscricao || isNaN(Number(idInscricao))) {
      return NextResponse.json({ error: "Código inválido ou leitura corrompida. Tente novamente." })
    }

    if (!["entrada", "saida"].includes(tipoPresenca)) {
      return NextResponse.json({ error: "Tipo de presença inválido." })
    }

    const idInscricaoNumero = Number(idInscricao)

    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricaoNumero },
      include: { eventos: true }
    })

    if (!inscricao) {
      return NextResponse.json({ error: "Ingresso não encontrado ou não cadastrado no sistema." })
    }

    const agora = new Date()

    if (tipoPresenca === "entrada") {
      if (inscricao.presenca_entrada === true) {
        return NextResponse.json({ error: "Atenção: A entrada deste aluno já foi registrada anteriormente!" })
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: idInscricaoNumero },
        data: { presenca_entrada: true, horario_entrada: agora },
      })

      return NextResponse.json({ success: `Entrada autorizada! Evento: ${inscricao.eventos?.titulo || "Acadêmico"}` })

    } else {
      if (inscricao.presenca_entrada !== true) {
        return NextResponse.json({ error: "Bloqueado: Não é possível registrar saída sem um check-in de entrada prévio!" })
      }

      if (inscricao.presenca_saida === true) {
        return NextResponse.json({ error: "Atenção: A saída deste aluno já foi registrada anteriormente!" })
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: idInscricaoNumero },
        data: { presenca_saida: true, horario_saida: agora },
      })

      return NextResponse.json({ success: "Saída registrada com sucesso! Carga horária computada." })
    }

  } catch (error) {
    console.error("Erro ao registrar presença:", error)
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 })
  }
}
