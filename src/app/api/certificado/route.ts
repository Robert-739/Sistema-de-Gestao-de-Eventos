import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"

export async function GET(request: NextRequest) {
  try {
    // 1. Pega o id_inscricao vindo da URL (Ex: /api/certificado?id=45)
    const { searchParams } = new URL(request.url)
    const idInscricaoStr = searchParams.get("id")

    if (!idInscricaoStr || isNaN(Number(idInscricaoStr))) {
      return new NextResponse("ID de inscrição inválido.", { status: 400 })
    }

    const idInscricao = Number(idInscricaoStr)

    // 2. Busca a inscrição trazendo os dados do Aluno (usuario) e do Evento junto
    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricao },
      include: {
        eventos: true,
        // Caso sua relação com a tabela de usuários se chame 'usuarios' ou similar, ajuste abaixo se necessário:
        usuarios: true 
      }
    })

    if (!inscricao) {
      return new NextResponse("Inscrição não encontrada.", { status: 404 })
    }

    // 3. Trava de segurança: Garante que o aluno realmente completou o ciclo (Entrada e Saída)
    if (inscricao.presenca_entrada !== true || inscricao.presenca_saida !== true) {
      return new NextResponse("Certificado indisponível. Presença incompleta neste evento.", { status: 403 })
    }

    // 4. Criação do documento PDF em memória
    // Configura a página em formato Paisagem (A4, horizontal) que é o padrão de certificados
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    })

    // Coleta os pedaços do PDF conforme ele é desenhado
    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    // Promessa para garantir que o arquivo só será enviado quando o PDFKit terminar de desenhar tudo
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      // ---- DESENHO DO LAYOUT DO CERTIFICADO ----
      
      // Borda decorativa externa
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke("#eab308") // Amarelo/Dourado do seu tema

      // Borda decorativa interna fina
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .lineWidth(1)
         .stroke("#64748b") // Cinza Slate

      // Cabeçalho / Título do Documento
      doc.moveDown(4)
      doc.font("Helvetica-Bold")
         .fontSize(36)
         .fillColor("#0f172a") // Slate 900
         .text("CERTIFICADO DE PARTICIPAÇÃO", { align: "center" })

      doc.moveDown(1)
      doc.font("Helvetica")
         .fontSize(16)
         .fillColor("#475569") // Slate 600
         .text("Certificamos para os devidos fins que o estudante", { align: "center" })

      // Nome do Aluno (Destaque)
      doc.moveDown(1)
      doc.font("Helvetica-Bold")
         .fontSize(24)
         .fillColor("#eab308") // Amarelo Dourado
         .text(inscricao.usuarios?.nome || "Nome do Aluno", { align: "center" })

      // Texto de conclusão com as variáveis do banco
      doc.moveDown(1.5)
      doc.font("Helvetica")
         .fontSize(15)
         .fillColor("#475569")
         .text("concluiu com êxito sua participação no evento acadêmico", { align: "center" })

      // Título do Evento (Destaque)
      doc.moveDown(0.8)
      doc.font("Helvetica-Bold")
         .fontSize(20)
         .fillColor("#0f172a")
         .text(`"${inscricao.eventos?.titulo}"`, { align: "center" })

      // Carga horária e validação
      const cargaHoraria = inscricao.eventos?.carga_horaria || 0
      doc.moveDown(1.5)
      doc.font("Helvetica")
         .fontSize(14)
         .text(`cumprindo uma carga horária total de `, { align: "center", continued: true })
         .font("Helvetica-Bold")
         .text(`${cargaHoraria} horas`, { continued: false })

      // Rodapé com data e código de autenticidade único
      doc.moveDown(4)
      doc.font("Helvetica-Oblique")
         .fontSize(10)
         .fillColor("#94a3b8") // Cinza claro
         .text(`Código de Autenticidade Digital: SGEA-REG-${inscricao.id_inscricao}-${inscricao.eventos?.id_evento}`, { align: "center" })

      // Finaliza o desenho do documento
      doc.end()
    })

    // 5. Configura as respostas HTTP para forçar o navegador a baixar como anexo
    const nomeArquivo = `certificado-evento-${inscricao.id_inscricao}.pdf`
    
    // CORREÇÃO AQUI: Convertendo o Buffer do Node para Uint8Array para o Next.js aceitar nativamente
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`
      }
    })

  } catch (error) {
    console.error("Erro ao gerar PDF do certificado:", error)
    return new NextResponse("Erro interno no servidor ao gerar o certificado.", { status: 500 })
  }
}