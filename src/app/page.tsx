import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const cookieStore = await cookies()
  
  // Sempre que alguém entrar na URL limpa do site, 
  // nós deletamos os cookies para garantir que NENHUMA sessão antiga fique presa.
  cookieStore.delete("usuario_id")
  cookieStore.delete("usuario_perfil")

  // Força ir para a tela de login preencher os dados do zero
  redirect("/login")
}