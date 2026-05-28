"use server"

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  error: string | null;
};

export async function logarUsuario(prevState: LoginState | null, formData: FormData): Promise<LoginState> {
  const email = formData.get("email") as string;
  const senhaRaw = formData.get("senha") as string;
  const perfilSelecionado = formData.get("perfil_selecionado") as string; // 'ALU', 'COO' ou 'DIR'

  const usuario = await prisma.usuarios.findUnique({
    where: { email },
    include: { tipo_perfil: true } 
  });

  if (!usuario) {
    return { error: "E-mail ou senha incorretos." };
  }

  if (usuario.id_tipo_perfil !== perfilSelecionado) {
    return { error: `Este usuário não está cadastrado como ${perfilSelecionado === 'ALU' ? 'Aluno' : perfilSelecionado === 'COO' ? 'Coordenador' : 'Diretor'}.` };
  }

  const senhaCorreta = await bcrypt.compare(senhaRaw, usuario.senha);

  if (!senhaCorreta) {
    return { error: "E-mail ou senha incorretos." };
  }

  // Salva o ID do usuário de forma segura nos cookies do navegador
  const cookieStore = await cookies();
  cookieStore.set("usuario_id", String(usuario.id_usuario), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // Expira em 1 dia
    path: "/",
  });

  const perfil = usuario.id_tipo_perfil;

  if (perfil === "ALU") {
    redirect("/dashboard/aluno");
  } else if (perfil === "COO") {
    redirect("/dashboard/coordenador");
  } else if (perfil === "DIR") {
    redirect("/dashboard/diretor");
  } else {
    redirect("/"); 
  } 
}