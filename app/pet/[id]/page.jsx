'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@supabase/supabase-js'
import QRCode from 'qrcode'

// Inicialização segura do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!")
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function PetPublicPage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [qrCodeSvg, setQrCodeSvg] = useState('')
  const [enviandoLocalizacao, setEnviandoLocalizacao] = useState(false)
  const [sucessoLocalizacao, setSucessoLocalizacao] = useState(false)

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://pet-dog-tag-pzem.vercel.app/pet/${id}`

  useEffect(() => {
    async function fetchPetData() {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setPet(data)
      } catch (err) {
        console.error("Erro ao buscar pet:", err)
        setPet(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPetData()
  }, [id])

  useEffect(() => {
    if (id) {
      QRCode.toDataURL(currentUrl, { width: 1000, margin: 2 }, (err, url) => {
        if (!err) setQrCodeDataUrl(url)
      })
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
        const { latitude, longitude } = position.coords

        try {
          // 1. Salva o alerta de geolocalização no banco de dados do Supabase
          const { error } = await supabase
            .from('pet_alerts')
            .insert([{ pet_id: id, latitude, longitude }])

          if (error) throw error
          setSucessoLocalizacao(true)

          // 2. Prepara o link do Google Maps com as coordenadas exatas
          const linkGoogleMaps = `https://www.google.com/maps?q=${latitude},${longitude}`
          
          // 3. Monta a mensagem automática e redireciona para o WhatsApp do dono
          const mensagem = encodeURIComponent(`🚨 Olá! Encontrei seu pet ${pet.name}! Estou aqui: ${linkGoogleMaps}`)
          const numeroWhatsApp = pet.phone ? pet.phone.replace(/\D/g, '') : ''

          if (numeroWhatsApp) {
            window.location.href = `https://wa.me/55${numeroWhatsApp}?text=${mensagem}`
          } else {
            alert("Localização salva com sucesso! O dono não cadastrou um telefone, mas o alerta foi registrado.")
          }

        } catch (err) {
          console.error("Erro ao inserir alerta:", err)
          alert("Erro ao salvar localização no banco.")
          setEnviandoLocalizacao(false)
        }
      },
      (error) => {
        console.error("Erro de geolocalização:", error)
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
          <p className="text-slate-400 text-sm">Verifique se o ID da tag está correto.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl">
        <div className="text-center mb-6">
          <span className="bg-red-950 text-red-400 border border-red-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">🚨 Pet Perdido?</span>
          <h1 className="text-3xl font-extrabold text-white mt-3">{pet.name}</h1>
          <p className="text-sm text-slate-400">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 space-y-3 text-sm">
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">Dono:</span>
            <span className="text-slate-200 font-medium">{pet.owner_name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-xs uppercase font-semibold">WhatsApp:</span>
            <a href={`https://wa.me/55${pet.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline block">{pet.phone}</a>
          </div>
          {pet.notes && (
            <div>
              <span className="text-slate-500 block text-xs uppercase font-semibold">Cuidados e Alergias:</span>
              <span className="text-amber-300 font-medium">{pet.notes}</span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <button 
            onClick={handleEnviarLocalizacao} 
            disabled={enviandoLocalizacao || sucessoLocalizacao} 
            className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-lg transition ${sucessoLocalizacao ? 'bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
          >
            {enviandoLocalizacao ? 'Obtendo GPS...' : sucessoLocalizacao ? '📍 Localização Enviada!' : '📍 Enviar Minha Localização'}
          </button>
        </div>

        {pet.is_active && (
          <div className="border-t border-slate-800 pt-6 text-center">
            <h2 className="text-sm font-semibold text-indigo-400 mb-3">Gerenciamento (Dono)</h2>
            {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="w-36 h-36 mx-auto mb-4 bg-white p-2 rounded-lg" />}
            <div className="space-y-2">
              <a href={qrCodeDataUrl} download={`qrcode-${pet.name}.png`} className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl transition">Baixar PNG</a>
              <button onClick={downloadSvg} className="block w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl border border-slate-700 transition">Baixar SVG (CNC)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}