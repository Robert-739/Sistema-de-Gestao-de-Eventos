import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"
import path from "path"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const usuarioIdCookie = cookieStore.get("usuario_id")?.value

    if (!usuarioIdCookie) {
      return new NextResponse("Acesso não autorizado. Faça login primeiro.", { status: 401 })
    }

    const usuarioLogadoId = Number(usuarioIdCookie)

    const { searchParams } = new URL(request.url)
    const idInscricaoStr = searchParams.get("id")

    if (!idInscricaoStr || isNaN(Number(idInscricaoStr))) {
      return new NextResponse("ID de inscrição inválido.", { status: 400 })
    }

    const idInscricao = Number(idInscricaoStr)

    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricao },
      include: {
        eventos: true,
        usuarios: true
      }
    })

    if (!inscricao) {
      return new NextResponse("Inscrição não encontrada no sistema.", { status: 404 })
    }

    if (inscricao.id_aluno !== usuarioLogadoId) {
      return new NextResponse("Acesso negado. Este certificado não pertence à sua conta.", { status: 403 })
    }

    if (inscricao.presenca_entrada !== true || inscricao.presenca_saida !== true) {
      return new NextResponse("Certificado indisponível. Presença incompleta.", { status: 403 })
    }

    const raizProjeto = process.cwd()
    const fonteRegular = path.resolve(raizProjeto, "src/assets/fonts/Roboto-Regular.ttf")
    const fonteBold = path.resolve(raizProjeto, "src/assets/fonts/Roboto-Bold.ttf")

    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      font: fonteRegular
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      doc.registerFont("Custom-Bold", fonteBold)

      const pageWidth = doc.page.width
      const pageHeight = doc.page.height

      const azulMarinho = "#0b1b3d" 
      const douradoNobre = "#c5a85c"
      const textoSuave = "#334155" 
      const cinzaClaro = "#cbd5e1" 

      doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
        .lineWidth(4)
        .stroke(azulMarinho)

      doc.rect(34, 34, pageWidth - 68, pageHeight - 68)
        .lineWidth(1.5)
        .stroke(douradoNobre)

      const cantos = [
        { x: 25, y: 25, w: 15, h: 15 },                     // Superior Esquerdo
        { x: pageWidth - 40, y: 25, w: 15, h: 15 },         // Superior Direito
        { x: 25, y: pageHeight - 40, w: 15, h: 15 },         // Inferior Esquerdo
        { x: pageWidth - 40, y: pageHeight - 40, w: 15, h: 15 } // Inferior Direito
      ]
      cantos.forEach(canto => {
        doc.rect(canto.x, canto.y, canto.w, canto.h).fill(azulMarinho)
      })

      doc.moveDown(3)
      doc.moveTo(pageWidth / 2 - 60, doc.y)
        .lineTo(pageWidth / 2 + 60, doc.y)
        .lineWidth(1)
        .stroke(douradoNobre)

      doc.moveDown(1.5)
      doc.font("Custom-Bold")
        .fontSize(32)
        .fillColor(azulMarinho)
        .text("CERTIFICADO", { align: "center", characterSpacing: 2 })

      doc.moveDown(0.3)
      doc.font(fonteRegular)
        .fontSize(11)
        .fillColor(douradoNobre)
        .text("DE PARTICIPAÇÃO EM EVENTO ACADÊMICO", { align: "center", characterSpacing: 1 })

      doc.moveDown(2.5)
      doc.font(fonteRegular)
        .fontSize(15)
        .fillColor(textoSuave)
        .text("Certificamos para os devidos fins que o estudante", { align: "center" })

      doc.moveDown(0.8)
      doc.font("Custom-Bold")
        .fontSize(26)
        .fillColor(azulMarinho)
        .text(inscricao.usuarios?.nome || "Estudante", { align: "center" })

      doc.moveDown(1)
      doc.font(fonteRegular)
        .fontSize(15)
        .fillColor(textoSuave)
        .text("concluiu com êxito sua participação no evento acadêmico", { align: "center" })

      doc.moveDown(0.6)
      doc.font("Custom-Bold")
        .fontSize(18)
        .fillColor(douradoNobre)
        .text(`"${inscricao.eventos?.titulo || "Evento Acadêmico"}"`, { align: "center" })

      const cargaHoraria = inscricao.eventos?.carga_horaria || 0
      doc.moveDown(1.2)
      doc.font(fonteRegular)
        .fontSize(14.5)
        .fillColor(textoSuave)
        .text(`cumprindo uma carga horária total de ${cargaHoraria} horas.`, { align: "center" })
        .font("Custom-Bold")
        .fillColor(azulMarinho)
        .text(`${cargaHoraria} horas.`, { continued: false })

      doc.moveDown(3.5)
      const currentY = doc.y

      doc.font(fonteRegular)
        .fontSize(11)
        .fillColor(textoSuave)
        .text(`Limeira, SP, ${new Date().toLocaleDateString('pt-BR')}`, 80, currentY, { width: 250, align: "left" })

      const linhaAssinaturaX = pageWidth - 330
      doc.moveTo(linhaAssinaturaX, currentY)
        .lineTo(linhaAssinaturaX + 250, currentY)
        .lineWidth(0.8)
        .stroke(cinzaClaro)

      doc.font(fonteRegular)
        .fontSize(10)
        .fillColor(textoSuave)
        .text("Coordenação de Ensino", linhaAssinaturaX, currentY + 8, { width: 250, align: "center" })
        .font("Custom-Bold")
        .fontSize(9)
        .fillColor(douradoNobre)
        .text("ORGANIZAÇÃO ACADÊMICA", { align: "center" })
    })

    const nomeArquivo = `certificado-evento-${inscricao.id_inscricao}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`
      }
    })

  } catch (error) {
    console.error("Erro crítico ao gerar PDF do certificado:", error)
    return new NextResponse("Erro interno no servidor ao gerar o certificado.", { status: 500 })
  }
}