"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Calendar, Clock, QrCode, X, Trash2 } from "lucide-react"
import { cancelarInscricao } from "../actions"

interface Evento {
  titulo: string
  data_inicio: Date | string
}

interface Inscricao {
  id_inscricao: number
  presenca_entrada: boolean | null
  presenca_saida: boolean | null
  eventos: Evento | null
}

export function CardIngresso({ inscricao }: { inscricao: Inscricao }) {
  const [modalAberto, setModalAberto] = useState(false)

  const deletar = async () => {
    if (confirm("Deseja realmente cancelar sua inscrição neste evento?")) {
      const res = await cancelarInscricao(inscricao.id_inscricao)
      if (res?.error) alert(res.error)
    }
  }

  return (
    <>
      <div className="bg-gradient-to-br from-yellow-200 to-yellow-600 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden group border border-gray-500">
        <div className="flex flex-col h-full justify-between">
          <div>
            <span className="text-[9px] uppercase tracking-wider bg-white/70 text-gray-900  font-bold px-2 py-0.5 rounded-full">
              Ingresso Confirmado
            </span>
            <h3 className="font-bold text-sm mt-2 line-clamp-1">{inscricao.eventos?.titulo}</h3>

            {/* Status de Presença */}
            <div className="mt-4 flex gap-2 text-[10px]">
              <span className={`px-2 py-0.5 rounded font-medium ${inscricao.presenca_entrada ? "bg-white/20 text-gray-950" : "bg-white/80 text-gray-900"}`}>
                {inscricao.presenca_entrada ? "In: Check-in OK" : "In: Pendente"}
              </span>
              <span className={`px-2 py-0.5 rounded font-medium ${inscricao.presenca_saida ? "bg-white/20 text-gray-950" : "bg-white/80 text-gray-900"}`}>
                {inscricao.presenca_saida ? "Out: Check-out OK" : "Out: Pendente"}
              </span>
            </div>
            {inscricao.presenca_entrada && inscricao.presenca_saida && (
              <a
                href={`/api/certificado?id=${inscricao.id_inscricao}`}
                className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow active:scale-95 animate-pulse"
              >
                Baixar Meu Certificado
              </a>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={deletar}
              className="p-2 text-black hover:text-red-400 rounded-lg transition-colors"
              title="Cancelar inscrição"
            >
              <Trash2 size={16} />
            </button>

            <button
              onClick={() => setModalAberto(true)}
              className="bg-white text-gray-950 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 hover:bg-indigo-50 transition-all active:scale-95"
            >
              <QrCode size={14} /> Ver QR Code
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DO QR CODE */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl relative text-center">
            <button
              onClick={() => setModalAberto(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-bold text-md text-gray-900 mb-1 pr-6">{inscricao.eventos?.titulo}</h3>
            <p className="text-xs text-gray-500 mb-6">Apresente este código no início e no término do evento</p>

            <div className="bg-gray-50 p-4 rounded-xl inline-block border border-gray-100 shadow-inner mb-6">
              <QRCodeSVG
                value={String(inscricao.id_inscricao)}
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#0f172a"}
                level={"H"}
              />
            </div>

            <div className="text-[10px] text-gray-400 bg-gray-50 py-2 px-4 rounded-lg inline-block">
              ID Ingresso: <span className="font-mono font-semibold text-gray-600">{inscricao.id_inscricao}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}