import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Calendar, Plus, Clock, Users, Award, User, ArrowRight } from "lucide-react"
import { eventos } from "@/generated/prisma"

// Função para buscar os eventos direto no servidor (Server Component)
async function obterEventos() {
  try {
    const lista = await prisma.eventos.findMany({
      orderBy: {
        data_inicio: "desc",
      },
    })
    return lista
  } catch (error) {
    console.error("Erro ao buscar eventos:", error)
    return []
  }
}

export default async function DashboardCoordenadorPage() {
  const eventosCadastrados = await obterEventos()

  return (
    <div className="p-6 sm:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Coordenador</h1>
            <p className="text-sm text-gray-500">Gerencie os eventos acadêmicos, palestras e controle de presença</p>
          </div>
          
          <Link 
            href="/dashboard/coordenador/novo-evento"
            className="inline-flex items-center justify-center gap-2 bg-yellow-300 hover:bg-yellow-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={18} />
            Criar Evento
          </Link>
        </div>

        {/* Grid de Eventos */}
        {eventosCadastrados.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto mt-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Nenhum evento publicado</h3>
            <p className="text-sm text-gray-500 mb-6">Você ainda não criou nenhum evento acadêmico para este semestre.</p>
            <Link 
              href="/dashboard/coordenador/novo-evento"
              className="text-sm font-semibold text-yellow-600 hover:text-yellow-700 inline-flex items-center gap-1"
            >
              Começar a criar agora <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-md font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>Eventos Ativos</span>
              <span className="bg-gray-200 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                {eventosCadastrados.length}
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventosCadastrados.map((evento: eventos) => {
                // Formatação simples de data para exibição amigável brasileira
                const dataFormatada = new Date(evento.data_inicio).toLocaleDateString("pt-BR")

                return (
                  <div 
                    key={evento.id_evento} 
                    className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Topo do Card - Substitui o Banner por um visual gradiente limpo */}
                    <div className="h-3 bg-gradient-to-r from-yellow-300 to-yellow-800 w-full" />
                    
                    {/* Conteúdo do Card */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-bold text-gray-900 group-hover:text-yellow-600 transition-colors line-clamp-1">
                          {evento.titulo}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mb-4 flex-1">
                        {evento.descricao}
                      </p>

                      {/* Metadados / Detalhes informativos */}
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 border-t border-gray-50 pt-4 mt-auto text-xs text-gray-500">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">{evento.palestrante}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 justify-end">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{dataFormatada}</span>
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <Users size={14} className="text-gray-400 shrink-0" />
                          <span>{evento.vagas_limite} vagas</span>
                        </div>

                        <div className="flex items-center gap-1.5 justify-end">
                          <Award size={14} className="text-gray-400 shrink-0" />
                          <span className="bg-yellow-50 text-yellow-800 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                            +{evento.carga_horaria}h Acadêmicas
                          </span>
                        </div>
                      </div>

                      {/* Ações do Card */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors">
                          Editar
                        </button>
                        
                        {/* Esse botão futuramente vai abrir o leitor de QR Code para este evento específico */}
                        <button className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95">
                          Escanear Presença
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}