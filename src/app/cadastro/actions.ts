"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// Tipo para manter o estado do formulário sincronizado com o componente
export type FormState = {
  error: string | null;
  success: boolean;
};

export async function registrarUsuario(
  prevState: FormState | null, 
  formData: FormData
): Promise<FormState> {
  // Captura dos dados do formulário
  const nome = formData.get("nome") as string;
  const email = formData.get("email") as string;
  const senhaRaw = formData.get("senha") as string;

  // Regra de Negócio: Nesta página, todo novo cadastro é automaticamente um ALUNO.
  // Isso impede que alunos se cadastrem como Coordenadores/Diretores manualmente.
  const id_tipo_perfil = "ALU"; 

  const saltRounds = 10;
  
  try {
    // 1. Verificação básica: o e-mail já existe? 
    // (O Prisma lançaria erro no .create, mas verificar antes é mais elegante)
    const usuarioExistente = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return { error: "Este e-mail já está sendo utilizado.", success: false };
    }

    // 2. Criptografando a senha para salvar apenas o HASH no banco
    const senhaHash = await bcrypt.hash(senhaRaw, saltRounds);

    // 3. Persistência no banco de dados via Prisma
    await prisma.usuarios.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        id_tipo_perfil,
      },
    });

    // Retorno de sucesso
    return { error: null, success: true };

  } catch (error) {
    console.error("Erro interno ao cadastrar:", error);
    return { 
      error: "Ocorreu um erro ao processar seu cadastro. Tente novamente mais tarde.", 
      success: false 
    };
  }
}