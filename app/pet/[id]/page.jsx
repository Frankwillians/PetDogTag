'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function PetProfilePage() {
  const params = useParams()
  const petId = params.id

  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDono, setIsDono] = useState(false)

  // Estados para edição (caso o dono queira alterar os dados)
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function fetchPetAndUser() {
      if (!petId) return

      // 1. Busca os dados do pet no Supabase
      const { data: petData, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (error || !petData) {
        console.error('Erro ao buscar pet:', error)
        setLoading(false)
        return
      }

      setPet(petData)
      setNome(petData.name || '')
      setTelefone(petData.phone || '')
      setNotes(petData.notes || '')

      // 2. Verifica se existe um usuário logado no momento
      const { data: { user } } = await supabase.auth.getUser()

      // 3. Compara se o ID do usuário logado é o mesmo do dono cadastrado no pet
      if (user && petData.user_id && user.id === petData.user_id) {
        setIsDono(true)
      }

      setLoading(false)
    }

    fetchPetAndUser()
  }, [petId])

  // Função para salvar alterações feitas pelo dono
  const handleSalvarAlteracoes = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('pets')
      .update({ name: nome, phone: telefone, notes: notes })
      .eq('id', petId)

    if (error) {
      alert('Erro ao atualizar os dados do pet.')
    } else {
      alert('Dados atualizados com sucesso!')
      setPet({ ...pet, name: nome, phone: telefone, notes: notes })
      setEditando(false)
    }
  }

  // Função para gerar o PDF da Dog Tag para CNC / Impressão
  const gerarPdfTag = async (petData) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text(`Moldes para Plaqueta CNC - ${petData.name}`, 20, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Espécie: ${petData.species.toUpperCase()} | Contato: ${petData.phone}`, 20, 26)
    doc.text(`Link do QR Code: https://pet-dog-tag-pzem.vercel.app/pet/${petData.id}`, 20, 32)

    // PARTE 1: FRENTE (Contorno + Ícone + Nome)
    doc.setLineWidth(0.5)
    doc.rect(20, 45, 60, 80) // Contorno da plaqueta (60x80mm)
    
    // Linha tracejada de dobra
    doc.setLineDash([2, 2], 0)
    doc.line(20, 85, 80, 85)
    doc.setLineDash([], 0)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(petData.name, 50, 65, { align: 'center' })

    const iconeTexto = petData.species.toLowerCase() === 'gato' ? '🐾 [GATO]' : '🐾 [CÃO]'
    doc.setFontSize(10)
    doc.text(iconeTexto, 50, 75, { align: 'center' })
    doc.text('(Lado Frontal / Dobra)', 50, 115, { align: 'center' })

    // PARTE 2: VERSO (QR Code para CNC)
    doc.rect(90, 45, 60, 80) // Contorno do verso

    const linkPublico = `https://pet-dog-tag-pzem.vercel.app/pet/${petData.id}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkPublico)}`

    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const reader = new FileReader()

      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const base64data = reader.result
        doc.addImage(base64data, 'PNG', 105, 55, 30, 30)
        
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text('LEIA O QR CODE', 120, 95, { align: 'center' })
        doc.text('(Verso da Plaqueta)', 120, 115, { align: 'center' })

        doc.save(`dog-tag-${petData.name.toLowerCase()}.pdf`)
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code no PDF:', error)
      alert('Erro ao gerar o PDF. Tente novamente.')
    }
  }

  // Função para enviar localização via WhatsApp (Apenas para quem achou o pet)
  const handleEnviarLocalizacao = () => {
    if (!pet?.phone) {
      alert('Número de contato não disponível.')
      return
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`
          
          const mensagem = encodeURIComponent(`Olá! Encontrei seu pet ${pet.name}. Aqui está minha localização atual: ${mapsLink}`)
          window.open(`https://wa.me/55${pet.phone}?text=${mensagem}`, '_blank')
        },
        () => {
          alert('Não foi possível obter sua localização. Verifique as permissões do navegador.')
        }
      )
    } else {
      alert('Seu navegador não suporta geolocalização.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Carregando informações do pet...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Pet não encontrado</h1>
          <p className="text-sm text-slate-400">Verifique o link da plaqueta ou entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  const linkPublicoPet = `https://pet-dog-tag-pzem.vercel.app/pet/${pet.id}`
  const urlQrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkPublicoPet)}`

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="inline-block bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {isDono ? '🛡️ PAINEL DO DONO (GERENCIAMENTO)' : '🐾 PERFIL DE EMERGÊNCIA / PET'}
          </div>
          <h1 className="text-3xl font-extrabold text-white">{pet.name}</h1>
          <p className="text-sm text-slate-400 capitalize mt-1">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
        </div>

        {/* SE FOR O DONO E ESTIVER EDITANDO OS DADOS */}
        {isDono && editando ? (
          <form onSubmit={handleSalvarAlteracoes} className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h2 className="text-xs font-bold uppercase text-indigo-400 mb-2">Editar Dados do Pet</h2>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Nome do Pet</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">WhatsApp de Contato</label>
              <input 
                type="text" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Cuidados / Alergias</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                rows="3"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs transition">
                Salvar Alterações
              </button>
              <button type="button" onClick={() => setEditando(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-lg text-xs transition">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* Informações Básicas */
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold uppercase text-xs">Dono:</span>
              <span className="text-slate-200 font-medium">{pet.owner_name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-semibold uppercase text-xs">WhatsApp:</span>
              <span className="text-slate-200 font-medium">{pet.phone || 'Não informado'}</span>
            </div>
            {pet.notes && (
              <div>
                <span className="text-slate-400 font-semibold uppercase text-xs block mb-1">Cuidados / Alergias:</span>
                <p className="text-slate-300 bg-slate-900 p-2 rounded-lg">{pet.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* CONDICIONAL DE AÇÕES */}
        {isDono ? (
          /* SE FOR O DONO: Editar, Baixar Molde PDF CNC e ver QR Code */
          <div className="space-y-4 pt-2">
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-sm transition"
              >
                ✏️ Alterar Dados do Pet
              </button>
            )}

            <button
              onClick={() => gerarPdfTag(pet)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              🛠️ Baixar Molde PDF (CNC / Impressão)
            </button>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-3">
              <p className="text-xs font-semibold text-slate-400">QR Code da Plaqueta:</p>
              <div className="flex justify-center">
                <img 
                  src={urlQrCodeImg} 
                  alt="QR Code da Dog Tag" 
                  className="w-32 h-32 border-4 border-white rounded-lg shadow-md" 
                />
              </div>
              <div className="flex gap-2 pt-1">
                <a 
                  href={urlQrCodeImg} 
                  download={`qrcode-${pet.name}.png`}
                  target="_blank"
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-lg text-center transition"
                >
                  Baixar PNG
                </a>
                <a 
                  href="/dashboard"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg text-center transition"
                >
                  Painel Geral
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* SE FOR ESTRANHO (RUA): Apenas o botão de GPS */
          <button
            onClick={handleEnviarLocalizacao}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
          >
            📍 Enviar Minha Localização
          </button>
        )}

      </div>
    </div>
  )
}