'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function PetPublicPage({ params }) {
  const { id } = params
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Estados do QR Code
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [qrCodeSvg, setQrCodeSvg] = useState('')

  // Estados de Geolocalização
  const [enviandoLocalizacao, setEnviandoLocalizacao] = useState(false)
  const [sucessoLocalizacao, setSucessoLocalizacao] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://pet-dog-tag-pzem.vercel.app/pet/${id}`

  useEffect(() => {
    async function fetchPetData() {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data) {
        setPet(data)
      }
      setLoading(false)
    }

    if (id) {
      fetchPetData()
    }
  }, [id])

  useEffect(() => {
    if (id) {
      // Gera QR Code em PNG de alta resolução
      QRCode.toDataURL(currentUrl, { width: 1000, margin: 2 }, (err, url) => {
        if (!err) setQrCodeDataUrl(url)
      })

      // Gera QR Code em Vetor SVG (Ideal para CNC / Laser)
      QRCode.toString(currentUrl, { type: 'svg', margin: 2 }, (err, svgString) => {
        if (!err) setQrCodeSvg(svgString)
      })
    }
  }, [id, currentUrl])

  const downloadSvg = () => {
    const blob = new Blob([qrCodeSvg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qrcode-dogtag-${id}.svg`
    a.click()
  }

  const handleEnviarLocalizacao = () => {
    if (!navigator.geolocation) {
      alert("Seu navegador não suporta geolocalização.")
      return
    }

    setEnviandoLocalizacao(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        try {
          const { error } = await supabase
            .from('pet_alerts')
            .insert([{ pet_id: id, latitude, longitude }])

          if (error) throw error

          setSucessoLocalizacao(true)
          alert("Localização enviada com sucesso! O dono do pet foi avisado.")
        } catch (err) {
          console.error("Erro ao salvar localização:", err)
          alert("Erro ao enviar localização ao banco de dados.")
        } finally {
          setEnviandoLocalizacao(false)
        }
      },
      (error) => {
        console.error(error)
        alert("Permissão de localização negada ou indisponível.")
        setEnviandoLocalizacao(false)
      },
      { enableHighAccuracy: true }
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>Carregando informações do pet...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Pet não encontrado</h1>
          <p className="text-slate-400 text-sm">Esta Dog Tag pode não estar cadastrada ou o link é inválido.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
        
        {/* Cabeçalho de Alerta de Pet Perdido */}
        <div className="text-center mb-6">
          <span className="bg-red-950 text-red-400 border border-red-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            🚨 Pet Encontrado?
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-3">{pet.name}</h1>
          <p className="text-sm text-slate-400">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
        </div>

        {/* Informações de Contato / Alergias */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 space-y-3 text-sm">
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">Dono:</span>
            <span className="text-slate-200 font-medium">{pet.owner_name || 'Não informado'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">Contato / WhatsApp:</span>
            {pet.phone ? (
              <a 
                href={`https://wa.me/55${pet.phone.replace(/\D/g, '')}?text=Olá! Encontrei seu pet ${pet.name}.`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 font-bold hover:underline block"
              >
                {pet.phone} (Clique para chamar no WhatsApp)
              </a>
            ) : (
              <span className="text-slate-200">Não informado</span>
            )}
          </div>
          {pet.notes && (
            <div>
              <span className="text-slate-500 block text-xs uppercase font-semibold">Cuidados e Alergias:</span>
              <span className="text-amber-300 font-medium">{pet.notes}</span>
            </div>
          )}
        </div>

        {/* Botão de Enviar Localização (Para quem achou) */}
        <div className="mb-8">
          <button
            onClick={handleEnviarLocalizacao}
            disabled={enviandoLocalizacao || sucessoLocalizacao}
            className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition ${
              sucessoLocalizacao 
                ? 'bg-emerald-700 text-white cursor-default' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
            }`}
          >
            {enviandoLocalizacao ? 'Obtendo GPS...' : sucessoLocalizacao ? '📍 Localização Enviada com Sucesso!' : '📍 Enviar Minha Localização Atual'}
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">Isso enviará sua posição atual em tempo real para o dono do pet.</p>
        </div>

        {/* Seção de QR Code e Downloads (Visível para o dono gerenciar/fabricar) */}
        {pet.is_active && (
          <div className="border-t border-slate-800 pt-6 text-center">
            <h2 className="text-sm font-semibold text-indigo-400 mb-3">Gerenciamento da Placa (QR Code)</h2>
            
            {qrCodeDataUrl && (
              <div className="bg-white p-3 rounded-xl inline-block mb-4 shadow">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-36 h-36 mx-auto" />
              </div>
            )}

            <div className="space-y-2">
              {qrCodeDataUrl && (
                <a
                  href={qrCodeDataUrl}
                  download={`dogtag-${pet.name}.png`}
                  className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl transition"
                >
                  Baixar QR Code (PNG)
                </a>
              )}
              {qrCodeSvg && (
                <button
                  onClick={downloadSvg}
                  className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition border border-slate-700"
                >
                  Baixar Vetor para CNC (.SVG)
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}