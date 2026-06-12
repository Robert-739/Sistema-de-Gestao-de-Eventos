import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"
import path from "path"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // 1. VERIFICAÇÃO DE AUTENTICAÇÃO — bloqueia acesso sem login
    const cookieStore = await cookies()
    const usuarioIdCookie = cookieStore.get("usuario_id")?.value

    if (!usuarioIdCookie) {
      return new NextResponse("Acesso não autorizado. Faça login primeiro.", { status: 401 })
    }

    const usuarioLogadoId = Number(usuarioIdCookie)

    // 2. Pega o id_inscricao vindo da URL
    const { searchParams } = new URL(request.url)
    const idInscricaoStr = searchParams.get("id")

    if (!idInscricaoStr || isNaN(Number(idInscricaoStr))) {
      return new NextResponse("ID de inscrição inválido.", { status: 400 })
    }

    const idInscricao = Number(idInscricaoStr)

    // 3. Busca a inscrição trazendo as relações exatas do schema
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

    // 4. VERIFICAÇÃO DE PROPRIEDADE — aluno só pode baixar o próprio certificado
    if (inscricao.id_aluno !== usuarioLogadoId) {
      return new NextResponse("Acesso negado. Este certificado não pertence à sua conta.", { status: 403 })
    }

    // 5. Trava de segurança — presença completa obrigatória
    if (inscricao.presenca_entrada !== true || inscricao.presenca_saida !== true) {
      return new NextResponse("Certificado indisponível. Presença incompleta.", { status: 403 })
    }

    // --- CONFIGURAÇÃO DE FONTES LOCAIS (Compatível com Turbopack e Vercel) ---
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

      // Registro das fontes estruturadas
      doc.registerFont("Custom-Bold", fonteBold)

      const pageWidth = doc.page.width
      const pageHeight = doc.page.height

      // --- PALETA DE CORES INSTITUCIONAL (Inspirada na Einstein de Limeira) ---
      const azulMarinho = "#0b1b3d"  // Cor principal, sóbria e acadêmica
      const douradoNobre = "#c5a85c" // Dourado fosco elegante para detalhes
      const textoSuave = "#334155"   // Grafite escuro para leitura confortável
      const cinzaClaro = "#cbd5e1"   // Para linhas de assinatura

      // ==========================================
      // 1. MOLDURA E BORDAS DECORATIVAS
      // ==========================================

      // Borda Externa Grossa (Azul Marinho)
      doc.rect(25, 25, pageWidth - 50, pageHeight - 50)
        .lineWidth(4)
        .stroke(azulMarinho)

      // Borda Interna Fina de Detalhe (Dourada)
      doc.rect(34, 34, pageWidth - 68, pageHeight - 68)
        .lineWidth(1.5)
        .stroke(douradoNobre)

      // Detalhes Geométricos nos 4 Cantos (Estilo Diploma Tradicional)
      const cantos = [
        { x: 25, y: 25, w: 15, h: 15 },                     // Superior Esquerdo
        { x: pageWidth - 40, y: 25, w: 15, h: 15 },         // Superior Direito
        { x: 25, y: pageHeight - 40, w: 15, h: 15 },         // Inferior Esquerdo
        { x: pageWidth - 40, y: pageHeight - 40, w: 15, h: 15 } // Inferior Direito
      ]
      cantos.forEach(canto => {
        doc.rect(canto.x, canto.y, canto.w, canto.h).fill(azulMarinho)
      })

      // ==========================================
      // 2. CABEÇALHO / ELEMENTO INSTITUCIONAL
      // ==========================================

      // Detalhe linear superior abaixo do "Brasão fictício"
      doc.moveDown(3)
      doc.moveTo(pageWidth / 2 - 60, doc.y)
        .lineTo(pageWidth / 2 + 60, doc.y)
        .lineWidth(1)
        .stroke(douradoNobre)

      // ==========================================
      // 3. CORPO DO CERTIFICADO (TEXTOS)
      // ==========================================

      // Título Principal
      doc.moveDown(1.5)
      doc.font("Custom-Bold")
        .fontSize(32)
        .fillColor(azulMarinho)
        .text("CERTIFICADO", { align: "center", characterSpacing: 2 })

      // Subtítulo
      doc.moveDown(0.3)
      doc.font(fonteRegular)
        .fontSize(11)
        .fillColor(douradoNobre)
        .text("DE PARTICIPAÇÃO EM EVENTO ACADÊMICO", { align: "center", characterSpacing: 1 })

      // Texto de introdução
      doc.moveDown(2.5)
      doc.font(fonteRegular)
        .fontSize(15)
        .fillColor(textoSuave)
        .text("Certificamos para os devidos fins que o estudante", { align: "center" })

      // Nome do Aluno (Destaque Central)
      doc.moveDown(0.8)
      doc.font("Custom-Bold")
        .fontSize(26)
        .fillColor(azulMarinho)
        .text(inscricao.usuarios?.nome || "Estudante", { align: "center" })

      // Texto de conclusão do evento
      doc.moveDown(1)
      doc.font(fonteRegular)
        .fontSize(15)
        .fillColor(textoSuave)
        .text("concluiu com êxito sua participação no evento acadêmico", { align: "center" })

      // Título do Evento (Destacado entre aspas com o dourado institucional)
      doc.moveDown(0.6)
      doc.font("Custom-Bold")
        .fontSize(18)
        .fillColor(douradoNobre)
        .text(`"${inscricao.eventos?.titulo || "Evento Acadêmico"}"`, { align: "center" })

      // Carga Horária Total
      const cargaHoraria = inscricao.eventos?.carga_horaria || 0
      doc.moveDown(1)
      doc.font(fonteRegular)
        .fontSize(14)
        .fillColor(textoSuave)
        .text(`cumprindo uma carga horária total de `, { align: "center", continued: true })
        .font("Custom-Bold")
        .fillColor(azulMarinho)
        .text(`${cargaHoraria} horas.`, { continued: false })

      // ==========================================
      // 4. BLOCO DE ASSINATURA E CONCLUSÃO
      // ==========================================

      // Espaço dinâmico para simular a data e a linha de assinatura institucional
      doc.moveDown(3.5)
      const currentY = doc.y

      // Lado Esquerdo: Local e Data
      doc.font(fonteRegular)
        .fontSize(11)
        .fillColor(textoSuave)
        .text(`Limeira, SP, ${new Date().toLocaleDateString('pt-BR')}`, 80, currentY, { width: 250, align: "left" })

      // Lado Direito: Linha de Assinatura da Coordenação/Direção
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

      // ==========================================
      // 5. RODAPÉ / AUTENTICIDADE
      // ==========================================

      // Código de validação discreto no limite inferior
      doc.y = pageHeight - 55
      doc.font(fonteRegular)
        .fontSize(9)
        .fillColor("#94a3b8")
        .text(`Código de Autenticidade Digital: SGEA-REG-${inscricao.id_inscricao}-${inscricao.eventos?.id_evento || 0}`, { align: "center" })

      doc.end()
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