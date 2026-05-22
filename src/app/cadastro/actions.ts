"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export type FormState = {
  error: string | null;
  success: boolean;
};

export async function registrarUsuario(
  prevState: FormState | null, 
  formData: FormData
): Promise<FormState> {
  
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senhaRaw = formData.get("senha") as string;

  const id_tipo_perfil = "ALU"; 

  const saltRounds = 10;
  
  try {
    
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return { error: "Este e-mail já está sendo utilizado.", success: false };
    }

    const senhaHash = await bcrypt.hash(senhaRaw, saltRounds);

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
    console.error("Erro interno ao cadastrar:", error);
    return { 
      error: "Ocorreu um erro ao processar seu cadastro. Tente novamente mais tarde.", 
      success: false 
    };
  }
}