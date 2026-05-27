"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type EventoState = {
  error: string | null;
  success: boolean;
};

export async function cadastrarEvento(prevState: EventoState | null, formData: FormData): Promise<EventoState> {
  const titulo = formData.get("titulo") as string;
  const descricao = formData.get("descricao") as string;
  const palestrante = formData.get("palestrante") as string;
  const cargaHoraria = Number(formData.get("carga_horaria"));
  const vagasLimite = Number(formData.get("vagas_limite"));
  const dataInicioStr = formData.get("data_inicio") as string;
  const dataFimStr = formData.get("data_fim") as string;
  const horaInicioStr = formData.get("hora_inicio") as string;
  const horaFimStr = formData.get("hora_fim") as string;

  // ID do coordenador mockado temporariamente até configurarmos a sessão/cookies do usuário logado
  // Depois substituiremos pelo ID real do coordenador vindo da sessão
  const id_usuario_coordenador = 4; 

  try {
    // Conversão de datas e horas para o formato aceito pelo PostgreSQL/Prisma
    const data_inicio = new Date(`${dataInicioStr}T00:00:00`);
    const data_fim = new Date(`${dataFimStr}T00:00:00`);
    const hora_inicio = new Date(`1970-01-01T${horaInicioStr}:00`);
    const hora_fim = new Date(`1970-01-01T${horaFimStr}:00`);

    await prisma.eventos.create({
      data: {
        titulo,
        descricao,
        palestrante,
        carga_horaria: cargaHoraria,
        vagas_limite: vagasLimite,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        id_usuario: id_usuario_coordenador,
      },
    });

    // Atualiza a listagem de eventos instantaneamente
    revalidatePath("/dashboard/coordenador");

    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao cadastrar evento:", error);
    return { error: "Erro interno ao salvar o evento no banco.", success: false };
  }
}

export async function registrarPresencaQRCode(
  idInscricao: string,
  tipoPresenca: "entrada" | "saida"
) {
  try {
    // 1. Limpeza de String e Validação de Entrada Nula/Vazia (Evita que bipes fantasmas quebrem o parseInt)
    const idLimpo = idInscricao?.trim();
    if (!idLimpo || isNaN(Number(idLimpo))) {
      return { error: "Código inválido ou leitura corrompida. Tente novamente." };
    }

    const idInscricaoNumero = Number(idLimpo);

    // 2. Busca a inscrição no banco de dados incluindo os dados do evento mapeado
    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricaoNumero },
      include: { eventos: true }
    });

    // 3. Validação de Existência Básica do Ingresso
    if (!inscricao) {
      return { error: "Ingresso não encontrado ou não cadastrado no sistema." };
    }

    const agora = new Date();

    // 4. Fluxo e Regras para Registro de ENTRADA (Check-In)
    if (tipoPresenca === "entrada") {
      if (inscricao.presenca_entrada === true) {
        return { error: "Atenção: A entrada deste aluno já foi registrada anteriormente!" };
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: idInscricaoNumero },
        data: {
          presenca_entrada: true,
          horario_entrada: agora,
        },
      });

      // Força as telas do Aluno e do Coordenador a atualizarem os crachás de status na hora
      revalidatePath("/dashboard/aluno");
      revalidatePath("/dashboard/coordenador");

      return { success: `Entrada autorizada! Evento: ${inscricao.eventos?.titulo || "Acadêmico"}` };
    } 
    
    // 5. Fluxo e Regras para Registro de SAÍDA (Check-Out)
    else {
      // Bloqueio crucial: impede check-out se o estudante nunca entrou no local
      if (inscricao.presenca_entrada !== true) {
        return { error: "Bloqueado: Não é possível registrar saída sem um check-in de entrada prévio!" };
      }

      if (inscricao.presenca_saida === true) {
        return { error: "Atenção: A saída deste aluno já foi registrada anteriormente!" };
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: idInscricaoNumero },
        data: {
          presenca_saida: true,
          horario_saida: agora,
        },
      });

      // Força a atualização do cache para liberar visualmente o futuro botão de certificado
      revalidatePath("/dashboard/aluno");
      revalidatePath("/dashboard/coordenador");

      return { success: `Saída registrada com sucesso! Carga horária computada.` };
    }

  } catch (error) {
    console.error("Erro crítico ao validar QR Code na Server Action:", error);
    return { error: "Erro interno no servidor ao processar os dados de presença." };
  }
}