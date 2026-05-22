"use client"

import { useActionState } from "react"
import { registrarUsuario, FormState } from "./actions"
import { User, Mail, Lock, GraduationCap } from "lucide-react"

const initialState: FormState = {
  error: null,
  success: false
}

export default function CadastroPage() {
  const [state, formAction, isPending] = useActionState(registrarUsuario, initialState)

  return (
    <div className="flex items-center justify-center min-h-screen bg-white sm:bg-[#eeeeee] font-sans p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-[450px] flex flex-col items-center">
        
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 w-full">
          <div className="bg-white shadow-sm flex-1 py-2 text-center rounded-lg text-sm font-bold text-gray-800">
            Cadastro do Aluno
          </div>
        </div>

        <div className="bg-[#FFD700] p-4 rounded-2xl mb-4">
          <GraduationCap size={40} className="text-black" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Crie sua conta</h1>
        <p className="text-gray-500 text-sm mb-8 text-center">
          Acesse seus eventos e certificados
        </p>
        
        {state?.error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4">
            {state.error}
          </div>
        )}

        {state?.success && (
          <div className="w-full bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-4 text-center">
            Cadastro realizado! <a href="/login" className="underline font-bold">Faça login agora.</a>
          </div>
        )}

        <form action={formAction} className="w-full flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="nome" 
                type="text" 
                placeholder="Como quer ser chamado?" 
                required 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="senha" 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                required 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all" 
              />
            </div>
          </div>

          <button 
            disabled={isPending || state?.success}
            type="submit" 
            className="w-full bg-[#FFD700] text-black font-bold py-3.5 rounded-xl hover:bg-[#F0C600] active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-2"
          >
            {isPending ? "Cadastrando..." : "Cadastrar"}
          </button>

          <p className="text-sm text-center text-gray-500 mt-2">
            Já tem uma conta? <a href="/login" className="text-[#FFD700] font-bold hover:underline">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  )
}