"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { buscarEventoPorId, atualizarEventoAction, excluirEventoAction } from "./actions"

interface EditarEventoProps {
  params: Promise<{ id: string }>
}

export default function EditarEventoPage({ params }: EditarEventoProps) {
  const { id } = use(params)
  const idEvento = Number(id)
  const router = useRouter()

  // Estados para controlar o carregamento e os campos do formulário
  const [carregando, setCarregando] = useState(true)
  const [titulo, setTitulo] = useState("")
  const [palestrante, setPalestrante] = useState("")
  const [descricao, setDescricao] = useState("")
  const [vagasLimite, setVagasLimite] = useState(1)
  
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  
  // Estado para quando o usuário quiser sobrescrever manualmente o cálculo automático
  const [cargaHorariaManual, setCargaHorariaManual] = useState<number | null>(null)

  const hojeMinimo = new Date().toISOString().slice(0, 16)

  // 1. Carrega os dados do evento ao abrir a página
  useEffect(() => {
    async function carregarDados() {
      try {
        const evento = await buscarEventoPorId(idEvento)
        if (!evento) {
          router.push("/dashboard/coordenador")
          return
        }
        setTitulo(evento.titulo)
        setPalestrante(evento.palestrante)
        setDescricao(evento.descricao)
        setVagasLimite(evento.vagas_limite)
        
        setDataInicio(new Date(evento.data_inicio).toISOString().slice(0, 16))
        if (evento.data_fim) {
          setDataFim(new Date(evento.data_fim).toISOString().slice(0, 16))
        }
        setCargaHorariaManual(evento.carga_horaria)
        setCarregando(false)
      } catch (error) {
        console.error("Erro ao carregar o evento:", error)
        router.push("/dashboard/coordenador")
      }
    }
    carregarDados()
  }, [idEvento, router])

  // 2. CÁLCULO EM TEMPO DE RENDERIZAÇÃO (Resolve o erro do ESLint)
  let cargaHorariaCalculada = 1
  if (dataInicio && dataFim) {
    const inicio = new Date(dataInicio)
    const fim = new Date(dataFim)
    const diferencaMs = fim.getTime() - inicio.getTime()
    
    if (diferencaMs > 0) {
      cargaHorariaCalculada = Math.ceil(diferencaMs / (1000 * 60 * 60))
    }
  }

  // Define qual valor exibir no input: se o usuário alterou manualmente usa o dele, senão usa o automático
  const cargaHorariaFinal = cargaHorariaManual !== null ? cargaHorariaManual : cargaHorariaCalculada

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()

    if (new Date(dataInicio) < new Date()) {
      alert("Não é permitido agendar ou alterar eventos para datas passadas.")
      return
    }

    if (new Date(dataFim) <= new Date(dataInicio)) {
      alert("A data e hora de término deve ser maior que a data e hora de início.")
      return
    }

    const formData = new FormData()
    formData.append("id_evento", String(idEvento))
    formData.append("titulo", titulo)
    formData.append("descricao", descricao)
    formData.append("palestrante", palestrante)
    formData.append("data_inicio", dataInicio)
    formData.append("data_fim", dataFim)
    formData.append("vagas_limite", String(vagasLimite))
    formData.append("carga_horaria", String(cargaHorariaFinal))

    await atualizarEventoAction(formData)
    router.push("/dashboard/coordenador")
  }

  async function handleExcluir() {
    if (confirm("Tem certeza que deseja excluir permanentemente este evento?")) {
      await excluirEventoAction(idEvento)
      router.push("/dashboard/coordenador")
    }
  }

  if (carregando) {
    return <div className="p-8 text-center text-gray-500 text-sm">Carregando dados do evento...</div>
  }

  return (
    <div className="p-4 sm:p-8 text-black min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
          <div>
            <Link href="/dashboard/coordenador" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black mb-2 transition-colors">
              <ArrowLeft size={14} /> Voltar ao painel
            </Link>
            <h1 className="text-lg font-bold text-gray-950">Editar Detalhes do Evento</h1>
          </div>

          <button
            type="button"
            onClick={handleExcluir}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
          >
            <Trash2 size={14} /> Excluir Evento
          </button>
        </div>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Título do Evento</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Palestrante / Responsável</label>
            <input
              type="text"
              value={palestrante}
              onChange={(e) => setPalestrante(e.target.value)}
              required
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Início (Data e Horário)</label>
              <input
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value)
                  setCargaHorariaManual(null) // Reseta o manual para recalcular automático se mudar a data
                }}
                min={hojeMinimo}
                required
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Término (Data e Horário)</label>
              <input
                type="datetime-local"
                value={dataFim}
                onChange={(e) => {
                  setDataFim(e.target.value)
                  setCargaHorariaManual(null) // Reseta o manual para recalcular automático se mudar a data
                }}
                min={dataInicio || hojeMinimo}
                required
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Limite de Vagas</label>
              <input
                type="number"
                value={vagasLimite}
                onChange={(e) => setVagasLimite(Number(e.target.value))}
                required
                min={1}
                className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Horas Acadêmicas <span className="text-blue-600 font-normal">(Calculado automático)</span>
              </label>
              <input
                type="number"
                value={cargaHorariaFinal}
                onChange={(e) => setCargaHorariaManual(Number(e.target.value))}
                required
                min={1}
                className="w-full text-sm bg-amber-50 border border-amber-300 font-semibold rounded-xl px-3 py-2.5 focus:outline-yellow-500 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Descrição Breve</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              rows={4}
              className="w-full text-sm bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-yellow-500 resize-none text-black"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95"
            >
              <Save size={16} /> Salvar Alterações
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}