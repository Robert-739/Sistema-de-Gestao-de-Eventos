"use server"

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
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

  // Resgata o ID do coordenador logado direto do cookie da sessão
  const cookieStore = await cookies();
  const idDoCookie = cookieStore.get("usuario_id")?.value;

  if (!idDoCookie) {
    return { error: "Sessão expirada ou usuário não autenticado. Faça login novamente.", success: false };
  }

  const id_usuario_coordenador = Number(idDoCookie); 

  try {
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
    const idLimpo = idInscricao?.trim();
    if (!idLimpo || isNaN(Number(idLimpo))) {
      return { error: "Código inválido ou leitura corrompida. Tente novamente." };
    }

    const idInscricaoNumero = Number(idLimpo);

    const inscricao = await prisma.inscricoes.findUnique({
      where: { id_inscricao: idInscricaoNumero },
      include: { eventos: true }
    });

    if (!inscricao) {
      return { error: "Ingresso não encontrado ou não cadastrado no sistema." };
    }

    const agora = new Date();

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

      revalidatePath("/dashboard/aluno");
      revalidatePath("/dashboard/coordenador");

      return { success: `Entrada autorizada! Evento: ${inscricao.eventos?.titulo || "Acadêmico"}` };
    } else {
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

      revalidatePath("/dashboard/aluno");
      revalidatePath("/dashboard/coordenador");

      return { success: `Saída registrada com sucesso! Carga horária computada.` };
    }

  } catch (error) {
    console.error("Erro crítico ao validar QR Code na Server Action:", error);
    return { error: "Erro interno no servidor ao processar os dados de presença." };
  }
}