"use client"

import { useEffect, useState, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Camera, CheckCircle2, AlertTriangle, ArrowLeft, LogIn, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  const [tipoPresenca, setTipoPresenca] = useState<"entrada" | "saida">("entrada")
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null)
  const [scaneando, setScaneando] = useState(true)
  const [cameraIniciada, setCameraIniciada] = useState(false) 
  
  const cameraRef = useRef<Html5Qrcode | null>(null)
  const tipoPresencaRef = useRef(tipoPresenca)

  // Sincroniza o ref sempre que o estado mudar para que o callback assíncrono leia o valor correto
  useEffect(() => {
    tipoPresencaRef.current = tipoPresenca
  }, [tipoPresenca])

  useEffect(() => {
    let verificarVideo: NodeJS.Timeout

    async function inicializarCameraPura() {
      if (!scaneando) return

      // Pequena pausa estratégica para garantir que o Next.js montou a div #reader no DOM
      await new Promise((resolve) => setTimeout(resolve, 150))

      const container = document.getElementById("reader")
      if (!container) return
      container.innerHTML = "" // Limpa completamente o HTML de instâncias anteriores

      // Instancia a classe estável controlada manualmente
      const html5QrCode = new Html5Qrcode("reader")
      cameraRef.current = html5QrCode

      try {
        // Inicia o hardware forçando o uso estrito da câmera traseira (environment)
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          async (decodedText: string) => {
            // --- SUCESSO NA LEITURA DO QR CODE ---
            setScaneando(false)
            setCameraIniciada(false)

            // Para o hardware da câmera imediatamente no cliente antes de enviar a requisição de rede
            if (cameraRef.current && cameraRef.current.isScanning) {
              await cameraRef.current.stop().catch((e) => console.error("Erro ao parar câmera:", e))
            }
            cameraRef.current = null

            setStatus({ success: "Processando código..." })

            // Chamada segura para a API Route nativa enviando o nome esperado pelo backend
            try {
              const resposta = await fetch("/api/presenca", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  idInscricao: decodedText, // CORRIGIDO: Agora batendo com o backend!
                  tipoPresenca: tipoPresencaRef.current
                })
              })

              const dados = await resposta.json()

              if (!resposta.ok || dados.error) {
                setStatus({ error: dados.error || "Falha ao registrar presença." })
              } else {
                setStatus({ success: dados.success || "Presença confirmada!" })
              }

            } catch (fetchError) {
              console.error("Erro de rede ao acessar /api/presenca:", fetchError)
              setStatus({ error: "Erro de comunicação com o servidor." })
            }
          },
          (_error: unknown) => {
            // Silencia os erros repetitivos de busca por frames visuais
          }
        )

        // Monitora quando a tag <video> nativa é injetada para remover o esqueleto de loading
        verificarVideo = setInterval(() => {
          const videoElement = document.querySelector("#reader video")
          if (videoElement) {
            setCameraIniciada(true)
            clearInterval(verificarVideo)
          }
        }, 200)

      } catch (err) {
        console.error("Erro fatal ao ligar a câmera traseira:", err)
        setCameraIniciada(false)
        setStatus({ error: "Não foi possível acessar a câmera. Verifique as permissões." })
      }
    }

    inicializarCameraPura()

    return () => {
      if (verificarVideo) clearInterval(verificarVideo)
      
      if (cameraRef.current && cameraRef.current.isScanning) {
        cameraRef.current.stop()
          .then(() => {
            cameraRef.current = null
          })
          .catch((err) => console.error("Erro ao parar câmera no desmonte do efeito:", err))
      }
    }
  }, [scaneando]) 

  const resetarScanner = () => {
    cameraRef.current = null
    setCameraIniciada(false) 
    setStatus(null)
    setScaneando(true)
  }

  return (
    <div className="min-h-screen bg-gray-100 text-white p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-700 rounded-2xl p-6 border border-white shadow-xl">
        
        <Link href="/dashboard/coordenador" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={14} /> Voltar ao Painel
        </Link>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold flex items-center justify-center gap-2">
            <Camera className="text-yellow-300" /> Scanner de Presença
          </h2>
          <p className="text-xs text-gray-400 mt-1">Utilize a câmera do aparelho para escanear o QR Code do ingresso do aluno</p>
        </div>

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

        <div className="overflow-hidden rounded-xl bg-gray-900 border border-gray-700 relative flex flex-col items-center justify-center min-h-[300px]">
          {scaneando ? (
            <div className="relative w-full min-h-[300px] flex items-center justify-center">
              
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
                #reader video {
                  width: 100% !important;
                  height: 100% !important;
                  object-fit: cover !important;
                  border-radius: 12px !important;
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