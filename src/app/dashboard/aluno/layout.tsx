import Link from "next/link"
import { LayoutDashboard, Ticket, LogOut, GraduationCap, Award } from "lucide-react"

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      
      {/* SIDEBAR FIXA DO ALUNO */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between p-5 border-r border-slate-900 shrink-0 hidden md:flex">
        <div>
          {/* Logo / Nome do Sistema */}
          <div className="flex items-center gap-2.5 px-2 py-4 border-b border-slate-900 mb-6">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Portal do Aluno
            </span>
          </div>

          {/* Links de Navegação */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Menu Estudantil
            </span>

            <Link 
              href="/dashboard/aluno" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-all group"
            >
              <LayoutDashboard size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              Eventos Disponíveis
            </Link>

            {/* Link âncora que joga direto para a seção de ingressos na mesma página */}
            <Link 
              href="/dashboard/aluno#ingressos" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-900 hover:text-white transition-all group"
            >
              <Ticket size={16} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
              Meus Ingressos (QR)
            </Link>
          </nav>
        </div>

        {/* Rodapé da Sidebar (Perfil do Aluno) */}
        <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">
              RA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">(----) Aluno</span>
              <span className="text-[10px] text-slate-400 truncate">(----).aluno@einstein.com</span>
            </div>
          </div>

          <Link 
            href="/login" 
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} />
            Sair
          </Link>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        {/* Topbar para Mobile */}
        <header className="bg-slate-950 text-white p-4 flex items-center justify-between md:hidden shadow-md">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-indigo-500" />
            <span className="font-bold text-xs">Portal do Aluno</span>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <Link href="/dashboard/aluno" className="text-slate-300 hover:text-white">Eventos</Link>
            <Link href="/dashboard/aluno#ingressos" className="text-indigo-400 font-bold">Meus QRs</Link>
          </div>
        </header>

        {/* Renderiza a página do aluno */}
        <div className="w-full">
          {children}
        </div>
      </main>

    </div>
  )
}