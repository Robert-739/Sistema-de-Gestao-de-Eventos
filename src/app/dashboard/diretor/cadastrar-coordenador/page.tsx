"use client"

import { useActionState } from "react"
import { cadastrarCoordenador } from "../actions"
import { User, Mail, Lock, UserPlus } from "lucide-react"

const initialState = { error: null, success: false }

export default function CadastrarCoordenadorPage() {
  const [state, formAction, isPending] = useActionState(cadastrarCoordenador, initialState)

  return (
    <div className="max-w-[500px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-black">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-[#FFD700] p-2.5 rounded-xl text-black">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Coordenador</h2>
          <p className="text-sm text-gray-500">Adicione os dados da equipe acadêmica</p>
        </div>
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-sm text-center font-semibold">
          Coordenador cadastrado com sucesso!
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              name="nome" 
              type="text" 
              required 
              placeholder="Nome do coordenador"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">E-mail Institucional</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="coordenacao@einstein.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm" 
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Senha Provisória</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              name="senha" 
              type="password" 
              required 
              placeholder="Digite uma senha inicial"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm" 
            />
          </div>
        </div>

        <button 
          disabled={isPending} 
          type="submit" 
          className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl hover:bg-[#F0C600] disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-2 text-sm active:scale-[0.99]"
        >
          {isPending ? "Cadastrando..." : "Confirmar Cadastro"}
        </button>
      </form>
    </div>
  )
}