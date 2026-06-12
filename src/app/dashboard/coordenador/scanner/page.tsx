"use client"

import { useEffect, useState, useRef } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { registrarPresencaQRCode } from "../actions"
import { Camera, CheckCircle2, AlertTriangle, ArrowLeft, LogIn, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ScannerPage() {
  const [tipoPresenca, setTipoPresenca] = useState<"entrada" | "saida">("entrada")
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null)
  const [scaneando, setScaneando] = useState(true)
  const [cameraIniciada, setCameraIniciada] = useState(false)

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const tipoPresencaRef = useRef(tipoPresenca)
  const processandoRef = useRef(false)

  useEffect(() => {
    tipoPresencaRef.current = tipoPresenca
  }, [tipoPresenca])

  useEffect(() => {
    if (!scaneando) return

    let scanner: Html5Qrcode | null = null

    async function iniciarCamera() {
      try {
        const container = document.getElementById("reader")
        if (container) container.innerHTML = ""

        scanner = new Html5Qrcode("reader")
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },

          // ✅ CALLBACK DE SUCESSO — totalmente síncrono no início, sem await bloqueante
          (decodedText: string) => {
            // Evita processar o mesmo QR Code duas vezes
            if (processandoRef.current) return
            processandoRef.current = true

            // 1. Para a câmera de forma NÃO-BLOQUEANTE (fire-and-forget)
            // Não usamos await aqui — no mobile o await trava o thread e quebra a página
            const scannerParaParar = scannerRef.current
            scannerRef.current = null
            if (scannerParaParar) {
              scannerParaParar.stop().catch(() => {
                // Ignora erros de parada — a câmera pode já ter sido liberada
              })
            }

            // 2. Atualiza UI imediatamente (antes mesmo do servidor responder)
            setScaneando(false)
            setCameraIniciada(false)
            setStatus({ success: "Processando código..." })

            // 3. Chama o servidor de forma independente
            registrarPresencaQRCode(decodedText, tipoPresencaRef.current)
              .then((resultado) => {
                if (resultado.error) {
                  setStatus({ error: resultado.error })
                } else {
                  setStatus({ success: resultado.success })
                }
                processandoRef.current = false
              })
              .catch(() => {
                setStatus({ error: "Erro de conexão. Verifique sua internet e tente novamente." })
                processandoRef.current = false
              })
          },

          // Callback de erro por frame — ignorado intencionalmente
          () => {}
        )

        setCameraIniciada(true)

      } catch (err) {
        console.error("Erro ao iniciar câmera:", err)
        setCameraIniciada(false)
      }
    }

    iniciarCamera()

    return () => {
      // Cleanup ao desmontar — também fire-and-forget para não bloquear navegação
      if (scanner) {
        scanner.stop().catch(() => {})
      }
    }
  }, [scaneando])

  const resetarScanner = () => {
    processandoRef.current = false
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
                  <div className="p-3 bg-gray-800 rounded-full">
                    <Loader2 size={24} className="animate-spin text-yellow-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-gray-200">Acessando câmera...</p>
                    <p className="text-[11px] text-gray-400 max-w-[220px]">
                      Aguarde a inicialização. Se solicitado, permita o acesso à câmera.
                    </p>
                  </div>
                </div>
              )}

              <style jsx global>{`
                #reader { border: none !important; width: 100% !important; }
                #reader img { display: none !important; }
                #reader__scan_region { background: transparent !important; }
              `}</style>

              <div id="reader" className="w-full bg-gray-900" />
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
