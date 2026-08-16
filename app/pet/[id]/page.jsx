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
  const [icone, setIcone] = useState('🐾')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)

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
      setIcone(petData.icone || '🐾')
      setFotoUrl(petData.foto_url || '')

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
      .update({ name: nome, phone: telefone, notes: notes, icone: icone, foto_url: fotoUrl })
      .eq('id', petId)

    if (error) {
      alert('Erro ao atualizar os dados do pet.')
    } else {
      alert('Dados atualizados com sucesso!')
      setPet({ ...pet, name: nome, phone: telefone, notes: notes, icone: icone, foto_url: fotoUrl })
      setEditando(false)
    }
  }

  // Função para lidar com o upload da foto direto para o Supabase Storage
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setEnviandoFoto(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${petId}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('fotos-pets')
      .upload(filePath, file)

    if (uploadError) {
      alert('Erro ao fazer upload da imagem: ' + uploadError.message)
      setEnviandoFoto(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('fotos-pets')
      .getPublicUrl(filePath)

    setFotoUrl(publicUrl)
    setEnviandoFoto(false)
    alert('Foto enviada com sucesso! Clique em "Salvar Alterações" logo abaixo.')
  }

  // Função para gerar o PDF da Dog Tag para CNC com Base64 para evitar erros
  const gerarPdfTag = async (petData) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Molde CNC / Dobrável - Plaqueta: ${petData.name}`, 15, 15)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Contato: ${petData.phone} | Link: https://pet-dog-tag-pzem.vercel.app/pet/${petData.id}`, 15, 21)

    // LADO 1: FRENTE (Contorno + Foto/Patinha + Nome do Pet)
    doc.setLineWidth(0.4)
    doc.rect(15, 30, 60, 60) // Quadrado da Frente

    const imgPadraoCao = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
    const imgPadraoGato = 'https://cdn-icons-png.flaticon.com/512/616/616554.png'
    
    let imagemParaUsar = petData.foto_url
    if (!imagemParaUsar) {
      const especie = (petData.species || '').toLowerCase()
      imagemParaUsar = especie.includes('gato') ? imgPadraoGato : imgPadraoCao
    }

    const toBase64 = async (url) => {
      try {
        const response = await fetch(url, { mode: 'cors' })
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      } catch (e) {
        console.warn('Falha ao converter imagem para base64:', e)
        return null
      }
    }

    try {
      const base64Img = await toBase64(imagemParaUsar)
      if (base64Img) {
        doc.addImage(base64Img, 'PNG', 30, 35, 30, 30)
      }
    } catch (err) {
      console.warn('Não foi possível carregar a imagem no PDF.', err)
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(petData.name, 45, 72, { align: 'center' })

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.text('[ Lado Frontal ]', 45, 84, { align: 'center' })

    // LINHA DE DOBRA CENTRALIZADA
    doc.setLineDash([1.5, 1.5], 0)
    doc.line(80, 25, 80, 95)
    doc.setLineDash([], 0)

    // LADO 2: VERSO (Contorno + QR Code)
    doc.rect(90, 30, 60, 60)

    const linkPublico = `https://pet-dog-tag-pzem.vercel.app/pet/${petData.id}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkPublico)}`

    try {
      const base64Qr = await toBase64(qrUrl)
      if (base64Qr) {
        doc.addImage(base64Qr, 'PNG', 103, 35, 34, 34)
      }
      
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.text('LEIA O QR CODE', 120, 76, { align: 'center' })
      
      doc.setFont("helvetica", "italic")
      doc.setFontSize(8)
      doc.text('[ Lado Traseiro / Verso ]', 120, 84, { align: 'center' })

      doc.save(`dog-tag-${petData.name.toLowerCase()}.pdf`)
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
  
  const especieAtual = (pet.species || '').toLowerCase()
  const fotoExibicao = pet.foto_url || (especieAtual.includes('gato') ? 'https://cdn-icons-png.flaticon.com/512/616/616554.png' : 'https://cdn-icons-png.flaticon.com/512/616/616408.png')

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="inline-block bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {isDono ? '🛡️ PAINEL DO DONO (GERENCIAMENTO)' : '🐾 PERFIL DE EMERGÊNCIA / PET'}
          </div>

          <div className="flex justify-center mb-3">
            <img src={fotoExibicao} alt={pet.name} className="w-24 h-24 object-cover rounded-full border-2 border-indigo-500 shadow-md bg-slate-950 p-1" />
          </div>

          <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
            <span>{pet.icone || '🐾'}</span> {pet.name}
          </h1>
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
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Ícone da Plaqueta (ao lado do nome)</label>
              <select 
                value={icone} 
                onChange={(e) => setIcone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="🐾">🐾 Patas</option>
                <option value="🐱">🐱 Gato</option>
                <option value="🐶">🐶 Cachorro</option>
                <option value="🦴">🦴 Osso</option>
                <option value="❤️">❤️ Coração</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Foto do Pet (Upload para o PDF)</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleUploadFoto}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
              {enviandoFoto && <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Enviando foto...</p>}
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
                ✏️ Alterar Dados / Foto
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