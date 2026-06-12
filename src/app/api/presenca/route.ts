import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // 1. Controle de Acesso: Verifica se o usuário operando o leitor está logado
    const cookieStore = await cookies()
    const usuarioId = cookieStore.get("usuario_id")?.value
    if (!usuarioId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
    }

    // 2. Extração dos dados enviados pelo Scanner do frontend
    const body = await request.json()
    const { idInscricao, tipoPresenca } = body

    // 3. Validações estritas de consistência dos dados recebidos
    if (!idInscricao || isNaN(Number(idInscricao))) {
      return NextResponse.json({ error: "Código inválido ou leitura corrompida. Tente novamente." })
    }

    if (!["entrada", "saida"].includes(tipoPresenca)) {
      return NextResponse.json({ error: "Tipo de presença inválido." })
    }

    const idInscricaoNumero = Number(idInscricao)

    // 4. Busca o ingresso (inscrição) no banco através do Prisma
    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricaoNumero },
      include: { eventos: true }
    })

    if (!inscricao) {
      return NextResponse.json({ error: "Ingresso não encontrado ou não cadastrado no sistema." })
    }

    const agora = new Date()

    // 5. Fluxo para Registro de Entrada (Check-In)
    if (tipoPresenca === "entrada") {
      if (inscricao.presenca_entrada === true) {
        return NextResponse.json({ error: "Atenção: A entrada deste aluno já foi registrada anteriormente!" })
      }

      // Salva a presença de entrada e o horário no banco de dados
      await prisma.inscricoes.update({
        where: { id_inscricao: idInscricaoNumero },
        data: { presenca_entrada: true, horario_entrada: agora },
      })

      return NextResponse.json({ success: `Entrada autorizada! Evento: ${inscricao.eventos?.titulo || "Acadêmico"}` })

    // 6. Fluxo para Registro de Saída (Check-Out)
    } else {
      if (inscricao.presenca_entrada !== true) {
        return NextResponse.json({ error: "Bloqueado: Não é possível registrar saída sem um check-in de entrada prévio!" })
      }

      if (inscricao.presenca_saida === true) {
        return NextResponse.json({ error: "Atenção: A saída deste aluno já foi registrada anteriormente!" })
      }

      // Salva a presença de saída e o horário no banco de dados
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