import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const cookieStore = await cookies()

  cookieStore.delete("usuario_id")
  cookieStore.delete("usuario_perfil")

  redirect("/login")
}