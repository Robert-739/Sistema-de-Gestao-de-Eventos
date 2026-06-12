"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export type FormState = {
  error: string | null;
  success: boolean;
};

export async function cadastrarCoordenador(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const nome = (formData.get("nome") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const senhaRaw = formData.get("senha") as string;

  if (!nome || !email || !senhaRaw) {
    return { error: "Preencha todos os campos.", success: false };
  }

  if (nome.length < 3) {
    return { error: "Informe o nome completo (mínimo 3 caracteres).", success: false };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Informe um e-mail válido.", success: false };
  }

  if (senhaRaw.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres.", success: false };
  }

  const saltRounds = 10;

  try {
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { email } });
    if (usuarioExistente) {
      return { error: "Este e-mail já está cadastrado no sistema.", success: false };
    }

    const senhaHash = await bcrypt.hash(senhaRaw, saltRounds);

    await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        id_tipo_perfil: "COO",
      },
    });

    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao cadastrar coordenador:", error);
    return { error: "Erro interno ao cadastrar coordenador.", success: false };
  }
}