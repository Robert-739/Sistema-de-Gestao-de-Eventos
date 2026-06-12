"use client"

import { useEffect, useState, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { registrarPresencaQRCode } from "../actions"
import { Camera, CheckCircle2, AlertTriangle, ArrowLeft, LogIn, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  const [tipoPresenca, setTipoPresenca] = useState<"entrada" | "saida">("entrada")
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null)
  const [scaneando, setScaneando] = useState(true)
  const [cameraIniciada, setCameraIniciada] = useState(false) 
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
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

      const verificarVideo = setInterval(() => {
        const videoElement = document.querySelector("#reader video")
        if (videoElement) {
          setCameraIniciada(true)
          clearInterval(verificarVideo)
        }
      }, 300)

      return () => clearInterval(verificarVideo)
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
  }, [scaneando]) 

  const resetarScanner = () => {
    setCameraIniciada(false) // Mudança para cá: Reseta o carregamento de forma segura antes do useEffect rodar
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
            <div className="relative w-full min-h-[300px] flex items-center justify-center">
              
              {/* TELA DE SKELETON LOADING */}
              {!cameraIniciada && (
                <div className="absolute inset-0 bg-gray-900 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="p-3 bg-gray-800 rounded-full text-yellow-500 animate-pulse">
                    <Loader2 size={24} className="animate-spin text-yellow-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-gray-200">Acessando câmera...</p>
                    <p className="text-[11px] text-gray-400 max-w-[220px]">
                      Aguardando inicialização do dispositivo ou permissão do navegador.
                    </p>
                  </div>
                </div>
              )}

              <style jsx global>{`
                #reader {
                  border: none !important;
                  width: 100% !important;
                }
                #reader img {
                  display: none !important;
                }
                #reader__dashboard_section_csr {
                  padding: 12px !important;
                  display: flex;
                  justify-content: center;
                }
                #reader__dashboard_section_csr button {
                  background-color: #3b82f6 !important;
                  color: white !important;
                  border: none !important;
                  padding: 8px 16px !important;
                  border-radius: 8px !important;
                  font-size: 12px !important;
                  font-weight: bold !important;
                  cursor: pointer !important;
                }
              `}</style>

              <div id="reader" className="w-full text-black bg-gray-900" />
            </div>
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