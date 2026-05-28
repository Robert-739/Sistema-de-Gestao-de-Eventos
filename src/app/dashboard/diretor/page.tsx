import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  Users, 
  Calendar, 
  UserPlus, 
  Award, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  XCircle 
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DiretorPage() {
  // 1. DISPARAR QUERIES EM PARALELO PARA MÁXIMA PERFORMANCE
  const [
    totalAlunos,
    totalCoordenadores,
    totalEventos,
    totalInscricoes,
    totalCertificadosValidos,
    eventosDetalhados,
    listaCoordenadores
  ] = await Promise.all([
    // Contagens básicas
    prisma.usuarios.count({ where: { id_tipo_perfil: "ALU" } }),
    prisma.usuarios.count({ where: { id_tipo_perfil: "COO" } }),
    prisma.eventos.count(),
    prisma.inscricoes.count(),
    
    // Total de inscrições que completaram entrada E saída (Certificados emitidos)
    prisma.inscricoes.count({
      where: {
        presenca_entrada: true,
        presenca_saida: true
      }
    }),

    // Dados profundos de eventos para o relatório de engajamento
    prisma.eventos.findMany({
      include: {
        usuarios: { // Coordenador do evento
          select: { nome: true }
        },
        inscricoes: {
          select: {
            presenca_entrada: true,
            presenca_saida: true
          }
        }
      },
      orderBy: { data_inicio: "desc" },
      take: 5 // Traz os 5 mais recentes/relevantes para não sobrecarregar
    }),

    // Lista de coordenadores para a tabela de gestão de acessos
    prisma.usuarios.findMany({
      where: { id_tipo_perfil: "COO" },
      select: { id_usuario: true, nome: true, email: true },
      orderBy: { nome: "asc" }
    })
  ])

  // 2. CÁLCULO DE MÉTRICAS ESTRATÉGICAS (REAIS)
  
  // Taxa de Efetividade de Certificação: Quantos % dos inscritos de fato ganharam o certificado
  const taxaCertificacao = totalInscricoes > 0 
    ? Math.round((totalCertificadosValidos / totalInscricoes) * 100) 
    : 0

  // Cálculo de Horas Complementares Injetadas no ecossistema da faculdade
  // Soma a carga horária de cada evento multiplicada pelos alunos que de fato completaram a presença dupla nele
  let totalHorasInjetadas = 0
  let totalVagasOfertadas = 0
  
  eventosDetalhados.forEach(evt => {
    const concluintesNoEvento = evt.inscricoes.filter(i => i.presenca_entrada && i.presenca_saida).length
    totalHorasInjetadas += concluintesNoEvento * (evt.carga_horaria || 0)
    totalVagasOfertadas += evt.vagas_limite || 0
  })

  // Taxa de Ocupação de Vagas (Aproveitamento das salas/auditórios)
  const taxaOcupacaoVagas = totalVagasOfertadas > 0
    ? Math.round((totalInscricoes / totalVagasOfertadas) * 100)
    : 0

  return (
    <div className="p-8 w-full mx-auto text-white flex flex-col gap-8 bg-gray-50 min-h-screen">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Painel do Diretor</h1>
          <p className="text-sm text-gray-500">Indicadores de performance acadêmica, auditoria e controle de acessos</p>
        </div>
        
        <Link 
          href="/dashboard/diretor/cadastrar-coordenador"
          className="flex items-center gap-2 bg-[#FFD700] hover:bg-[#F0C600] text-black font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98] w-fit"
        >
          <UserPlus size={18} />
          Cadastrar Novo Coordenador
        </Link>
      </div>

      {/* GRID DE CARDS INTELIGENTES (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Eficiência de Certificação */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Efetividade</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Award size={20} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900">{taxaCertificacao}%</span>
            <p className="text-xs text-gray-500 mt-1">Das inscrições viraram certificados</p>
          </div>
        </div>

        {/* Card 2: Impacto no Banco de Horas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horas Emitidas</span>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900">{totalHorasInjetadas}h</span>
            <p className="text-xs text-gray-500 mt-1">Injetadas no currículo dos alunos</p>
          </div>
        </div>

        {/* Card 3: Aproveitamento de Infraestrutura */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ocupação de Vagas</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-gray-900">{taxaOcupacaoVagas}%</span>
            <p className="text-xs text-gray-500 mt-1">Média de preenchimento de salas</p>
          </div>
        </div>

        {/* Card 4: Volume Total da Operação */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Geral</span>
            <div className="p-2.5 bg-gray-100 text-gray-600 rounded-xl">
              <Users size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div><strong className="text-gray-900 text-base block">{totalAlunos}</strong> Alunos</div>
            <div><strong className="text-gray-900 text-base block">{totalEventos}</strong> Eventos</div>
          </div>
        </div>

      </div>

      {/* BLOCO DUPLO: RELATÓRIO DE EVENTOS + EQUIPE ACADÊMICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1 & 2: RELATÓRIO DE ENGAJAMENTO DOS EVENTOS (AUDITORIA) */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-base">Auditoria de Engajamento por Evento</h2>
              <p className="text-xs text-gray-400">Análise de evasão entre leitura de entrada e saída do QR Code</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold bg-gray-50/20 text-xs uppercase tracking-wider">
                    <th className="p-4 pl-6">Evento / Responsável</th>
                    <th className="p-4 text-center">Inscritos</th>
                    <th className="p-4 text-center">Check-in (In)</th>
                    <th className="p-4 text-center">Check-out (Out)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eventosDetalhados.map((evt) => {
                    const totalIns = evt.inscricoes.length
                    const checkIn = evt.inscricoes.filter(i => i.presenca_entrada).length
                    const checkOut = evt.inscricoes.filter(i => i.presenca_saida).length

                    return (
                      <tr key={evt.id_evento} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-4 pl-6">
                          <span className="font-bold text-gray-900 block truncate max-w-[240px]">{evt.titulo}</span>
                          <span className="text-xs text-gray-400 block">Coord: {evt.usuarios?.nome || "Não atribuído"}</span>
                        </td>
                        <td className="p-4 text-center font-semibold text-gray-700">
                          {totalIns} <span className="text-xs text-gray-400 font-normal">/ {evt.vagas_limite}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg text-xs">
                            <CheckCircle2 size={12} /> {checkIn}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded-lg text-xs ${
                            checkOut === checkIn ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            <XCircle size={12} /> {checkOut}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUNA 3: EQUIPE DE COORDENADORES (CONTROLE DE ACESSOS) */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-800 text-base">Coordenadores Ativos</h2>
              <p className="text-xs text-gray-400">Controle de credenciais com nível de operador (COO)</p>
            </div>

            <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
              {listaCoordenadores.length === 0 ? (
                <p className="p-6 text-center text-sm text-gray-400">Nenhum coordenador na lista.</p>
              ) : (
                listaCoordenadores.map((coord) => (
                  <div key={coord.id_usuario} className="p-4 hover:bg-gray-50/50 transition-colors flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold flex items-center justify-between justify-content text-center justify-items-center text-xs pl-2.5">
                      {coord.nome.substring(0,2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-gray-900 text-sm block truncate">{coord.nome}</span>
                      <span className="text-xs text-gray-400 block truncate">{coord.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
            <span className="text-xs font-medium text-gray-400">Total de gestores homologados: {totalCoordenadores}</span>
          </div>
        </div>

      </div>

    </div>
  )
}