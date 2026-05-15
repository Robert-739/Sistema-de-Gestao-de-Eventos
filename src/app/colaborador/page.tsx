"use client"

import { useActionState, useState } from "react"
import { registrarColaborador } from "./actions"
import { User, Mail, Lock, ShieldCheck } from "lucide-react"

const initialState = { error: null, success: false }

export default function CadastroColaboradorPage() {
  const [state, formAction, isPending] = useActionState(registrarColaborador, initialState)
  const [perfil, setPerfil] = useState("COO") // Inicia como Coordenador

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#eeeeee] p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-[450px] flex flex-col items-center">
        
        <div className="bg-[#FFD700] p-4 rounded-2xl mb-6">
          <ShieldCheck size={40} className="text-black" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cadastro de Equipe</h1>
        
        {/* TABS para selecionar entre Coordenador e Diretor */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-full">
          <button 
            type="button"
            onClick={() => setPerfil("COO")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${perfil === "COO" ? "bg-white shadow-sm text-gray-800" : "text-gray-400"}`}
          >
            Coordenador
          </button>
          <button 
            type="button"
            onClick={() => setPerfil("DIR")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${perfil === "DIR" ? "bg-white shadow-sm text-gray-800" : "text-gray-400"}`}
          >
            Diretor
          </button>
        </div>

        {state?.error && <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{state.error}</div>}
        {state?.success && (
          <div className="w-full bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm text-center">
            Colaborador cadastrado! <a href="/login" className="font-bold underline">Ir para Login</a>
          </div>
        )}

        <form action={formAction} className="w-full flex flex-col gap-5">
          <input type="hidden" name="perfil_selecionado" value={perfil} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Nome do {perfil === "COO" ? "Coordenador" : "Diretor"}</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="nome" type="text" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700]" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">E-mail Institucional</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="email" type="email" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700]" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Senha de Acesso</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="senha" type="password" required className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FFD700]" />
            </div>
          </div>

          <button disabled={isPending} type="submit" className="w-full bg-[#FFD700] text-black font-bold py-3.5 rounded-xl hover:bg-[#F0C600] disabled:bg-gray-200 transition-all">
            {isPending ? "Cadastrando..." : `Cadastrar ${perfil === "COO" ? "Coordenador" : "Diretor"}`}
          </button>
        </form>
      </div>
    </div>
  )
}