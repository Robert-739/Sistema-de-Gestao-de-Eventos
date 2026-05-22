"use client"

import { useTransition } from "react"
import { inscreverNoEvento } from "../actions"

export function BotaoInscricao({ idEvento, jaInscrito }: { idEvento: number, jaInscrito: boolean }) {
  const [isPending, startTransition] = useTransition()

  const clicarBotao = () => {
    if (jaInscrito) return
    startTransition(async () => {
      const res = await inscreverNoEvento(idEvento)
      if (res?.error) alert(res.error)
    })
  }

  return (
    <button
      disabled={jaInscrito || isPending}
      onClick={clicarBotao}
      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.99] ${
        jaInscrito 
          ? "bg-green-100 text-green-700 cursor-not-allowed" 
          : "bg-yellow-600 text-white hover:bg-yellow-400 disabled:bg-gray-200"
      }`}
    >
      {isPending ? "Garantindo vaga..." : jaInscrito ? "✓ Inscrito no Evento" : "Garantir Minha Vaga"}
    </button>
  )
}