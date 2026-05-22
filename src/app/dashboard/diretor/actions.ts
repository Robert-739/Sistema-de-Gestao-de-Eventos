"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export type FormState = {
  error: string | null;
  success: boolean;
};

export async function cadastrarCoordenador(prevState: FormState | null, formData: FormData): Promise<FormState> {
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senhaRaw = formData.get("senha") as string;
  
  // Regra: O Diretor nesta tela só pode cadastrar COORDENADORES
  const id_tipo_perfil = "COO"; 

  const saltRounds = 10;
  
  try {
    // Verifica se o e-mail já existe
    const usuarioExistente = await prisma.usuarios.findUnique({ where: { email } });
    if (usuarioExistente) {
      return { error: "Este e-mail já está cadastrado no sistema.", success: false };
    }

    // Criptografa a senha gerada para o coordenador
    const senhaHash = await bcrypt.hash(senhaRaw, saltRounds);

    // Cria o coordenador no banco
    await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        id_tipo_perfil,
      },
    });

    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao cadastrar coordenador:", error);
    return { error: "Erro interno ao cadastrar coordenador.", success: false };
  }
}