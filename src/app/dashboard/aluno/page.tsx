import { prisma } from "@/lib/prisma"
import { Calendar, Clock, Award, User, Ticket, QrCode } from "lucide-react"
import { BotaoInscricao } from "./components/BotaoInscricao"
import { CardIngresso } from "./components/CardIngresso"

const ID_ALUNO_LOGADO = 2

async function obterDadosDoAluno() {
  const todosEventos = await prisma.eventos.findMany({
    include: {
      inscricoes: true
    },
    orderBy: { data_inicio: "asc" }
  })

  const minhasInscricoes = await prisma.inscricoes.findMany({
    where: { id_aluno: ID_ALUNO_LOGADO },
    include: { eventos: true },
    orderBy: { data_inscricao: "desc" }
  })

  return { todosEventos, minhasInscricoes }
}

export default async function DashboardAlunoPage() {
  const { todosEventos, minhasInscricoes } = await obterDadosDoAluno()

  return (
    <div className="p-6 sm:p-8 text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Portal do Aluno</h1>
          <p className="text-sm text-gray-500">Inscreva-se em eventos e acesse seus ingressos com QR Code para validação de presença</p>
        </div>

        {/* SEÇÃO 1: EVENTOS DISPONÍVEIS */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-yellow-700" /> Eventos Disponíveis
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todosEventos.map((evento) => {
              const jaInscrito = evento.inscricoes.some(ins => ins.id_aluno === ID_ALUNO_LOGADO)
              const dataFormatada = new Date(evento.data_inicio).toLocaleDateString("pt-BR")
              const vagasRestantes = evento.vagas_limite - evento.inscricoes.length

              return (
                <div key={evento.id_evento} className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-yellow-300 to-yellow-700 w-full" />
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-black mb-2 line-clamp-1">{evento.titulo}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1">{evento.descricao}</p>
                    
                    <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-3 text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1"><User size={13} /> <span className="truncate">{evento.palestrante}</span></div>
                      <div className="flex items-center gap-1 justify-end"><Calendar size={13} /> <span>{dataFormatada}</span></div>
                      <div className="flex items-center gap-1"><Award size={13} className="text-green-600" /> <span>+{evento.carga_horaria}h</span></div>
                      <div className="flex items-center gap-1 justify-end font-semibold text-yellow-600"><span>{vagasRestantes} vagas restantes</span></div>
                    </div>

                    {/* Botão interativo Client-Side */}
                    <BotaoInscricao idEvento={evento.id_evento} jaInscrito={jaInscrito} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SEÇÃO 2: MEUS INGRESSOS */}
        <div id="ingressos" className="border-t border-gray-200 pt-8 scroll-mt-6">
          <h2 className="text-lg font-bold text-black mb-6 flex items-center gap-2">
            <Ticket size={20} className="text-yellow-600" /> Meus Ingressos (QR Codes)
          </h2>

          {minhasInscricoes.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center max-w-sm mx-auto">
              <QrCode size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">Você não possui nenhum ingresso ativo. Inscreva-se em um evento acima!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {minhasInscricoes.map((inscricao) => (
                // Componente que vai gerenciar o modal do QR Code individualmente
                <CardIngresso key={inscricao.id_inscricao} inscricao={inscricao} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}