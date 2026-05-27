"use client"

import { useActionState } from "react"
import { cadastrarEvento } from "../actions"
import { Calendar, Clock, Users, Award, FileText, AlignLeft, User } from "lucide-react"

const initialState = { error: null, success: false }

export default function NovoEventoPage() {
  const [state, formAction, isPending] = useActionState(cadastrarEvento, initialState)

  return (
    <div className="p-6 flex items-center justify-center text-black">
      <div className="w-full max-w-[650px] bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
          <div className="bg-yellow-300 p-2.5 rounded-xl text-white">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Criar Novo Evento Acadêmico</h2>
            <p className="text-sm text-gray-500">Preencha as informações para disponibilizar o evento aos alunos</p>
          </div>
        </div>

        {/* Notificações */}
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-6 text-sm text-center font-semibold">
            Evento publicado com sucesso!
          </div>
        )}

        {/* Formulário */}
        <form action={formAction} className="flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Título do Evento</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="titulo" type="text" required placeholder="Ex: Workshop de Next.js Avançado"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Palestrante / Convidado</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="palestrante" type="text" required placeholder="Nome do palestrante"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Descrição do Evento</label>
            <div className="relative">
              <AlignLeft size={18} className="absolute left-3 top-3 text-gray-400" />
              <textarea 
                name="descricao" required rows={3} placeholder="Descreva brevemente o cronograma e os tópicos do evento..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm resize-none" 
              />
            </div>
          </div>

          {/* Grid Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Data de Início</label>
              <input 
                name="data_inicio" type="date" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Data de Término</label>
              <input 
                name="data_fim" type="date" required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
              />
            </div>
          </div>

          {/* Grid Horários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Horário de Início</label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="hora_inicio" type="time" required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Horário de Término</label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="hora_fim" type="time" required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
                />
              </div>
            </div>
          </div>

          {/* Grid Vagas e Carga Horária */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Limite de Vagas</label>
              <div className="relative">
                <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="vagas_limite" type="number" min={1} required placeholder="Ex: 50"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Horas Complementares (Qtd)</label>
              <div className="relative">
                <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  name="carga_horaria" type="number" min={1} required placeholder="Ex: 4"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm" 
                />
              </div>
            </div>
          </div>

          <button 
            disabled={isPending} type="submit" 
            className="w-full bg-yellow-300 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-4 text-sm active:scale-[0.99]"
          >
            {isPending ? "Publicando Evento..." : "Publicar Evento"}
          </button>
        </form>

      </div>
    </div>
  )
}