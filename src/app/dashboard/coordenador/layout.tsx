import Link from "next/link"
import { LayoutDashboard, CalendarPlus, QrCode, LogOut, GraduationCap } from "lucide-react"

export default function CoordenadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-black">
      
      {/* SIDEBAR FIXA */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-5 border-r border-slate-800 shrink-0 hidden md:flex">
        <div>
          {/* Logo / Nome do Sistema */}
          <div className="flex items-center gap-2.5 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              CheckIn Acadêmico
            </span>
          </div>

          {/* Links de Navegação */}
          <nav className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Navegação
            </span>

            <Link 
              href="/dashboard/coordenador" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <LayoutDashboard size={16} className="text-slate-400 group-hover:text-yellow-500 transition-colors" />
              Painel Geral
            </Link>

            <Link 
              href="/dashboard/coordenador/novo-evento" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <CalendarPlus size={16} className="text-slate-400 group-hover:text-yellow-500 transition-colors" />
              Criar Novo Evento
            </Link>

            <Link 
              href="/dashboard/coordenador/scanner" 
              className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <QrCode size={16} className="text-slate-400 group-hover:text-yellow-500 transition-colors" />
              Escanear QR Code
            </Link>
          </nav>
        </div>

        {/* Rodapé da Sidebar (Perfil / Sair) */}
        <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-white">
              CO
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">Coordenador</span>
              <span className="text-[10px] text-slate-400 truncate">robert@faculdade.com</span>
            </div>
          </div>

          <Link 
            href="/login" 
            className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={16} />
            Sair do Sistema
          </Link>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (Onde o Next.js vai renderizar as páginas) */}
      <main className="flex-1 overflow-y-auto max-h-screen">
        {/* Topbar para Mobile (aparece apenas em telas pequenas) */}
        <header className="bg-slate-900 text-white p-4 flex items-center justify-between md:hidden shadow-md">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-blue-500" />
            <span className="font-bold text-xs">CheckIn Acadêmico</span>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <Link href="/dashboard/coordenador" className="text-slate-300 hover:text-white">Painel</Link>
            <Link href="/dashboard/coordenador/scanner" className="bg-blue-600 px-2.5 py-1 rounded-lg text-[11px] text-white">Scanner</Link>
          </div>
        </header>

        {/* Renderiza a página atual */}
        <div className="w-full">
          {children}
        </div>
      </main>

    </div>
  )
}