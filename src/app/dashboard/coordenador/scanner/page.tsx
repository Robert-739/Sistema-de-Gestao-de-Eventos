"use client"

import { useEffect, useState, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { registrarPresencaQRCode } from "../actions"
import { Camera, CheckCircle2, AlertTriangle, ArrowLeft, LogIn, LogOut } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  const [tipoPresenca, setTipoPresenca] = useState<"entrada" | "saida">("entrada")
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null)
  const [scaneando, setScaneando] = useState(true)
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  // useRef para manter o tipoPresenca sempre atualizado dentro do callback do scanner
  const tipoPresencaRef = useRef(tipoPresenca)

  // Sincroniza o ref sempre que o estado mudar
  useEffect(() => {
    tipoPresencaRef.current = tipoPresenca
  }, [tipoPresenca])

  useEffect(() => {
    if (scaneando) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,             
          qrbox: { width: 250, height: 250 }, 
          aspectRatio: 1.0
        },
        /* verbose= */ false
      )

      scannerRef.current = scanner

      scanner.render(
        async (decodedText: string) => {
          setScaneando(false) 
          
          if (scannerRef.current) {
            scannerRef.current.clear().catch((e) => console.error(e))
            scannerRef.current = null
          }

          setStatus({ success: "Processando código..." })

          // Usa o valor do ref, que sempre tem o estado mais recente (entrada ou saida)
          const resultado = await registrarPresencaQRCode(decodedText, tipoPresencaRef.current)
          
          if (resultado.error) {
            setStatus({ error: resultado.error })
          } else {
            setStatus({ success: resultado.success })
          }
        },
        (_error: unknown) => {
          // Ignora erros contínuos de busca
        }
      )
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
          .then(() => {
            scannerRef.current = null
          })
          .catch((err: unknown) => console.error("Erro ao limpar scanner", err))
      }
    }
  }, [scaneando]) // Roda apenas quando o scanner for resetado

  const resetarScanner = () => {
    setStatus(null)
    setScaneando(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-700 rounded-2xl p-6 border border-white shadow-xl">
        
        {/* Voltar */}
        <Link href="/dashboard/coordenador" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Voltar ao Painel
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Camera className="text-yellow-300" /> Scanner de Presença
          </h2>
          <p className="text-xs text-gray-400 mt-1">Utilize a câmera do aparelho para escanear o QR Code do ingresso do aluno</p>
        </div>

        {/* Chave de Seleção: Entrada ou Saída */}
        {scaneando && (
          <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded-xl mb-6 border border-gray-700">
            <button
              onClick={() => setTipoPresenca("entrada")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tipoPresenca === "entrada" ? "bg-yellow-500 text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              <LogIn size={14} /> Check-In (Entrada)
            </button>
            <button
              onClick={() => setTipoPresenca("saida")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${tipoPresenca === "saida" ? "bg-yellow-500 text-white shadow" : "text-gray-400 hover:text-white"}`}
            >
              <LogOut size={14} /> Check-Out (Saída)
            </button>
          </div>
        )}

        {/* Container do Scanner da Câmera */}
        <div className="overflow-hidden rounded-xl bg-gray-900 border border-gray-700 relative flex flex-col items-center justify-center min-h-[300px]">
          {scaneando ? (
            /* Mantemos o id fixo sem trocar a key, a câmera nunca desliga ao clicar nos botões! */
            <div id="reader" className="w-full text-black bg-white" />
          ) : (
            <div className="p-6 text-center flex flex-col items-center justify-center">
              {status?.error ? (
                <>
                  <AlertTriangle size={48} className="text-red-500 mb-3" />
                  <p className="text-sm font-semibold text-red-400">{status.error}</p>
                </>
              ) : (
                <>
                  <CheckCircle2 size={48} className="text-green-500 mb-3" />
                  <p className="text-sm font-semibold text-green-400">{status?.success}</p>
                </>
              )}
              
              <button
                onClick={resetarScanner}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition-all active:scale-95"
              >
                Escanear Próximo Aluno
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-4">
          <span className="text-[10px] text-gray-500">
            Modo Atual: <b className="uppercase text-gray-300">{tipoPresenca === "entrada" ? "Controle de Entrada" : "Controle de Saída"}</b>
          </span>
        </div>

      </div>
    </div>
  )
}