"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  error: string | null;
};

export async function logarUsuario(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const senhaRaw = formData.get("senha") as string;
  const perfilSelecionado = formData.get("perfil_selecionado") as string;

  // --- VALIDAÇÃO SERVER-SIDE ---
  if (!email || !senhaRaw || !perfilSelecionado) {
    return { error: "Preencha todos os campos." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "Informe um e-mail válido." };
  }

  if (senhaRaw.length < 6) {
    return { error: "A senha deve ter no mínimo 6 caracteres." };
  }

  if (!["ALU", "COO", "DIR"].includes(perfilSelecionado)) {
    return { error: "Perfil inválido." };
  }
  // --- FIM DA VALIDAÇÃO ---

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
      include: { tipo_perfil: true }
    });

    if (!usuario) {
      return { error: "E-mail ou senha incorretos." };
    }

    if (usuario.id_tipo_perfil !== perfilSelecionado) {
      const nomePerfil = perfilSelecionado === "ALU" ? "Aluno" : perfilSelecionado === "COO" ? "Coordenador" : "Diretor";
      return { error: `Este usuário não está cadastrado como ${nomePerfil}.` };
    }

    const senhaCorreta = await bcrypt.compare(senhaRaw, usuario.senha);
    if (!senhaCorreta) {
      return { error: "E-mail ou senha incorretos." };
    }

    // Salva ID e PERFIL nos cookies (necessário para o middleware funcionar)
    const cookieStore = await cookies();
    const cookieOpcoes = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 horas
      path: "/",
    };

    cookieStore.set("usuario_id", String(usuario.id_usuario), cookieOpcoes);
    cookieStore.set("usuario_perfil", usuario.id_tipo_perfil, cookieOpcoes);

    const perfil = usuario.id_tipo_perfil;
    if (perfil === "ALU") redirect("/dashboard/aluno");
    else if (perfil === "COO") redirect("/dashboard/coordenador");
    else if (perfil === "DIR") redirect("/dashboard/diretor");
    else redirect("/");

  } catch (error: unknown) {
    // O redirect do Next.js lança uma exceção internamente — não deve ser capturada
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Erro no login:", error);
    return { error: "Erro interno. Tente novamente mais tarde." };
  }
}
