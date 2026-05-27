import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"
import path from "path" 
import fs from "fs"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    // 1. Pega o id_inscricao vindo da URL (Ex: /api/certificado?id=6)
    const { searchParams } = new URL(request.url)
    const idInscricaoStr = searchParams.get("id")

    if (!idInscricaoStr || isNaN(Number(idInscricaoStr))) {
      return new NextResponse("ID de inscrição inválido.", { status: 400 })
    }

    const idInscricao = Number(idInscricaoStr)

    // 2. Busca a inscrição trazendo exatamente as relações do seu schema (usuarios e eventos)
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

    // 3. Trava de segurança com base no seu schema (aceita null ou false como pendente)
    if (inscricao.presenca_entrada !== true || inscricao.presenca_saida !== true) {
      return new NextResponse("Certificado indisponível. Presença incompleta.", { status: 403 })
    }

    // --- CONFIGURAÇÃO DE FONTES LOCAIS PARA A VERCEL ---
    const pastaFontes = path.join(process.cwd(), "src", "assets", "fonts")
    const fonteRegular = path.join(pastaFontes, "Roboto-Regular.ttf")
    const fonteBold = path.join(pastaFontes, "Roboto-Bold.ttf")

    // ALTERAÇÃO AQUI: Criamos o documento sem a primeira página automática.
    // Isso impede o PDFKit de tentar carregar a fonte 'Helvetica' padrão do sistema.
    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
      autoFirstPage: false // <--- EVITA O ERRO DO HELVETICA.AFM
    })

    const chunks: Buffer[] = []
    doc.on("data", (chunk) => chunks.push(chunk))

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", (err) => reject(err))

      // Primeiro registramos nossas fontes customizadas
      doc.registerFont("Custom-Regular", fonteRegular)
      doc.registerFont("Custom-Bold", fonteBold)

      // Agora que as fontes seguras estão registradas, adicionamos a página manualmente
      doc.addPage()

      // ---- DESENHO DO LAYOUT DO CERTIFICADO ----
      
      // Borda decorativa externa dourada
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke("#eab308") 

      // Borda decorativa interna fina cinza
      doc.rect(26, 26, doc.page.width - 52, doc.page.height - 52)
         .lineWidth(1)
         .stroke("#64748b") 

      // Título Principal
      doc.moveDown(4)
      doc.font("Custom-Bold")
         .fontSize(36)
         .fillColor("#0f172a") 
         .text("CERTIFICADO DE PARTICIPAÇÃO", { align: "center" })

      doc.moveDown(1)
      doc.font("Custom-Regular")
         .fontSize(16)
         .fillColor("#475569") 
         .text("Certificamos para os devidos fins que o estudante", { align: "center" })

      // Nome do Aluno
      doc.moveDown(1)
      doc.font("Custom-Bold")
         .fontSize(24)
         .fillColor("#eab308") 
         .text(inscricao.usuarios?.nome || "Estudante", { align: "center" })

      doc.moveDown(1.5)
      doc.font("Custom-Regular")
         .fontSize(15)
         .fillColor("#475569")
         .text("concluiu com êxito sua participação no evento acadêmico", { align: "center" })

      // Título do Evento
      doc.moveDown(0.8)
      doc.font("Custom-Bold")
         .fontSize(20)
         .fillColor("#0f172a")
         .text(`"${inscricao.eventos?.titulo || "Evento Acadêmico"}"`, { align: "center" })

      // Carga horária total
      const cargaHoraria = inscricao.eventos?.carga_horaria || 0
      doc.moveDown(1.5)
      doc.font("Custom-Regular")
         .fontSize(14)
         .text(`cumprindo uma carga horária total de `, { align: "center", continued: true })
         .font("Custom-Bold")
         .text(`${cargaHoraria} horas.`, { continued: false })

      // Código de validação no rodapé
      doc.moveDown(4)
      doc.font("Custom-Regular")
         .fontSize(10)
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