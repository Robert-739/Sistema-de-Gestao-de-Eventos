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
    // 1. Verifica se a inscrição existe no banco
    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: Number(idInscricao) }, // Convertendo para número já que no schema está como Int autoincrement
      include: { eventos: true }
    });

    if (!inscricao) {
      return { error: "Ingressso/Inscrição inválida ou não encontrada." };
    }

    const agora = new Date();

    // 2. Atualiza a Entrada ou a Saída dependendo do que o coordenador selecionou na tela
    if (tipoPresenca === "entrada") {
      if (inscricao.presenca_entrada) {
        return { error: "Entrada deste aluno já foi registrada anteriormente!" };
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: Number(idInscricao) },
        data: {
          presenca_entrada: true,
          horario_entrada: agora,
        },
      });
      return { success: `Entrada liberada para o evento: ${inscricao.eventos?.titulo}` };
    } else {
      // Validação de Saída
      if (!inscricao.presenca_entrada) {
        return { error: "Atenção: Este aluno não registrou a Entrada neste evento!" };
      }
      if (inscricao.presenca_saida) {
        return { error: "Saída deste aluno já foi registrada anteriormente!" };
      }

      await prisma.inscricoes.update({
        where: { id_inscricao: Number(idInscricao) },
        data: {
          presenca_saida: true,
          horario_saida: agora,
        },
      });
      return { success: `Saída registrada! Carga horária validada com sucesso.` };
    }

  } catch (error) {
    console.error("Erro ao validar QR Code:", error);
    return { error: "Erro interno no servidor ao processar o QR Code." };
  }
}