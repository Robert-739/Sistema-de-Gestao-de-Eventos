"use client"

import { useActionState, useState } from "react"
import { logarUsuario } from "./actions"
import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react"

const initialState = {
  error: null as string | null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(logarUsuario, initialState)
  const [perfil, setPerfil] = useState("ALU") // Estado para controlar a Tab ativa
  const [verSenha, setVerSenha] = useState(false)

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#eeeeee] font-sans p-4 text-black">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-[450px] flex flex-col items-center">
        
        {/* Ícone Amarelo do Cabeçalho */}
        <div className="bg-[#FFD700] p-4 rounded-2xl mb-6">
          <GraduationCap size={40} className="text-black" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-1 text-center">
          Bem-vindo, {perfil === "ALU" ? "Aluno" : perfil === "COO" ? "Coordenador" : "Diretor"}!
        </h1>
        <p className="text-gray-500 text-sm mb-8 text-center">
          Acesse seus eventos e certificados
        </p>
        
        {/* TABS - Seletor de Perfil (Igual à imagem) */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8 w-full">
          <button 
            type="button"
            onClick={() => setPerfil("ALU")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${perfil === "ALU" ? "bg-white shadow-sm text-gray-800" : "text-gray-400"}`}
          >
            Aluno
          </button>
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

        {state?.error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 text-center">
            {state.error}
          </div>
        )}

        <form action={formAction} className="w-full flex flex-col gap-5">
          {/* Input oculto para enviar o perfil selecionado para a Action */}
          <input type="hidden" name="perfil_selecionado" value={perfil} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">E-mail ou RA</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="email" 
                type="email" 
                placeholder="seu@email.com" 
                required 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all placeholder:text-gray-300" 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                name="senha" 
                type={verSenha ? "text" : "password"} 
                placeholder="Digite sua senha" 
                required 
                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all placeholder:text-gray-300" 
              />
              <button 
                type="button"
                onClick={() => setVerSenha(!verSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            disabled={isPending}
            type="submit" 
            className="w-full bg-[#FFD700] text-black font-bold py-3.5 rounded-xl hover:bg-[#F0C600] active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 transition-all mt-2"
          >
            {isPending ? "Autenticando..." : "Entrar"}
          </button>

          <p className="text-sm text-center text-gray-500 mt-4">
            Esqueceu sua senha? <a href="#" className="text-gray-400 underline">Recuperar acesso</a>
          </p>
          
          <p className="text-sm text-center text-gray-500">
            Ainda não tem conta? <a href="/cadastro" className="text-[#FFD700] font-bold hover:underline">Cadastre-se</a>
          </p>
        </form>
      </div>
    </div>
  )
}