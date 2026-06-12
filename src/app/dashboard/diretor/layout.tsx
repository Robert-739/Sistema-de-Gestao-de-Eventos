import Link from "next/link"
import { LayoutDashboard, LogOut, GraduationCap, UserPlus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function DiretorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const usuarioId = cookieStore.get("usuario_id")?.value

  if (!usuarioId) redirect("/login")

  const usuario = await prisma.usuarios.findUnique({
    where: {
      id_usuario: Number(usuarioId),
    },
    select: {
      nome: true,
      email: true,
    }
  })

  const nomeUsuario = usuario?.nome || "Diretor"
  const emailUsuario = usuario?.email || "" 

  const obtenerIniciais = (nome: string) => {
    const partes = nome.trim().split(" ")
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
    }
    return partes[0] ? partes[0][0].toUpperCase() : "DI"
  }

  const iniciais = obtenerIniciais(nomeUsuario)

  async function fazerLogout() {
    "use server"
    const cookieStore = await cookies()
    cookieStore.delete("usuario_id")
    cookieStore.delete("usuario_perfil")
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0 hidden md:flex">
        <div>
          <div className="flex items-center gap-2.5 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Direção Executiva
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Estratégico
            </span>

            <Link 
              href="/dashboard/diretor" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <LayoutDashboard size={16} className="text-slate-400 group-hover:text-yellow-500 transition-colors" />
              Painel do Diretor
            </Link>

            <Link 
              href="/dashboard/diretor/cadastrar-coordenador" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <UserPlus size={16} className="text-slate-400 group-hover:text-yellow-500 transition-colors" />
              Novo Coordenador
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {iniciais}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate text-slate-200" title={nomeUsuario}>
                {nomeUsuario}
              </span>
              <span className="text-[10px] text-slate-400 truncate" title={emailUsuario}>
                {emailUsuario}
              </span>
            </div>
          </div>

          <form action={fazerLogout}>
            <button 
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left"
            >
              <LogOut size={16} />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto max-h-screen">
        <header className="bg-slate-900 text-white p-4 flex items-center justify-between md:hidden shadow-md">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-yellow-500" />
            <span className="font-bold text-xs">Direção</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/dashboard/diretor" className="text-slate-300 hover:text-white">Painel</Link>
            <form action={fazerLogout}>
              <button type="submit" className="text-red-400 hover:text-red-500 flex items-center gap-0.5">
                <LogOut size={13} /> Sair
              </button>
            </form>
          </div>
        </header>

        <div className="w-full">
          {children}
        </div>
      </main>

    </div>
  )
}
