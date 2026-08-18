'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { jsPDF } from 'jspdf'
import { QRCodeSVG } from 'qrcode.react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function PetProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const petId = params?.id
  const modoPublicoForcado = searchParams.get('public') === 'true'

  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDonoReal, setIsDonoReal] = useState(false)

  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [notes, setNotes] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  
  // Estado para o formato selecionado no select do PDF
  const [formatoPdf, setFormatoPdf] = useState('osso')

  // Estados de calibração para ajustar o posicionamento no preview e no PDF
  const [offsetX, setOffsetX] = useState(0) // Ajuste horizontal
  const [offsetY, setOffsetY] = useState(0) // Ajuste vertical
  const [fontSize, setFontSize] = useState(12) // Tamanho da fonte
  
  // Estado para armazenar o link de fallback do WhatsApp
  const [whatsappLink, setWhatsappLink] = useState('')

  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin)
    }

    async function fetchPetAndUser() {
      if (!petId) return

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
      setFotoUrl(petData.foto_url || '')

      supabase.from('pet_scans').insert([{ pet_id: petId }]).then()

      const { data: { user } } = await supabase.auth.getUser()

      if (user && petData.user_id && user.id === petData.user_id) {
        setIsDonoReal(true)
      }

      setLoading(false)
    }

    fetchPetAndUser()
  }, [petId])

  const handleSalvarAlteracoes = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('pets')
      .update({ name: nome, phone: telefone, notes: notes, foto_url: fotoUrl })
      .eq('id', petId)

    if (error) {
      alert('Erro ao atualizar os dados do pet.')
    } else {
      alert('Dados atualizados com sucesso!')
      setPet({ ...pet, name: nome, phone: telefone, notes: notes, foto_url: fotoUrl })
      setEditando(false)
    }
  }

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

  // GERADOR DE PDF USANDO OS AJUSTES DE CALIBRAÇÃO DA TELA
  const gerarPdfTag = async (petData, formato) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const currentDomain = window.location.origin
    const linkDinamico = `${currentDomain}/pet/${petData.id}`

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Molde DarkStar Pets (${formato.toUpperCase()}) - ${petData.name}`, 15, 15)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Contato: ${petData.phone} | Escaneie para ver o perfil de emergência`, 15, 21)

    const moldesImagens = {
      osso: `${currentDomain}/moldes/osso.png`,
      patinha: `${currentDomain}/moldes/patinha.png`,
      circulo: `${currentDomain}/moldes/circulo.png`
    }

    const imagemMoldeUrl = moldesImagens[formato] || moldesImagens.osso

    const toBase64 = async (url) => {
      try {
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) throw new Error('Falha ao buscar imagem do molde')
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      } catch (e) {
        console.warn('Não foi possível carregar o molde:', url)
        return null
      }
    }

    // FATOR DE CONVERSÃO DOS AJUSTES DA TELA PARA MILÍMETROS DO PDF
    const mmOffsetX = offsetX * 0.1
    const mmOffsetY = offsetY * 0.1

    // ================= FRENTE (Molde de Fundo + Nome do Pet) =================
    const xFrente = 20
    const yFrente = 32
    const tamanhoTag = 52

    try {
      const base64Molde = await toBase64(imagemMoldeUrl)
      if (base64Molde) {
        doc.addImage(base64Molde, 'PNG', xFrente, yFrente, tamanhoTag, tamanhoTag)
      }
    } catch (e) {
      console.warn('Erro ao inserir imagem de molde na frente', e)
    }

    const centroTagX = xFrente + (tamanhoTag / 2) + mmOffsetX
    const centroTagY = yFrente + (tamanhoTag / 2) + mmOffsetY

    // Nome e subtítulo aplicando a calibração do usuário
    doc.setFont("helvetica", "bold")
    doc.setFontSize(fontSize) // Usa o tamanho ajustado nos botões
    doc.setTextColor(20, 20, 20)
    doc.text(petData.name, centroTagX, centroTagY - 1, { align: 'center' })
    
    doc.setFontSize(6)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(80, 80, 80)
    doc.text('DARKSTAR PETS', centroTagX, centroTagY + (fontSize * 0.4) + 2, { align: 'center' })

    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.text('[ Lado Frontal ]', xFrente + (tamanhoTag / 2), yFrente + tamanhoTag + 8, { align: 'center' })

    // Linha pontilhada divisória central
    doc.setLineDash([1.5, 1.5], 0)
    doc.line(85, 25, 85, 95)
    doc.setLineDash([], 0)

    // ================= VERSO (Molde de Fundo + QR Code) =================
    const xVerso = 98
    const yVerso = 32

    try {
      const base64Molde = await toBase64(imagemMoldeUrl)
      if (base64Molde) {
        doc.addImage(base64Molde, 'PNG', xVerso, yVerso, tamanhoTag, tamanhoTag)
      }
    } catch (e) {
      console.warn('Erro ao inserir imagem de molde no verso', e)
    }

    const centroVersoX = xVerso + (tamanhoTag / 2)
    const centroVersoY = yVerso + (tamanhoTag / 2)

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkDinamico)}`

    try {
      const base64Qr = await toBase64(qrUrl)
      if (base64Qr) {
        const tamanhoQr = 24
        const qrOffsetX = centroVersoX - (tamanhoQr / 2)
        const qrOffsetY = centroVersoY - (tamanhoQr / 2) - 2
        doc.addImage(base64Qr, 'PNG', qrOffsetX, qrOffsetY, tamanhoQr, tamanhoQr)
      }
      
      doc.setFont("helvetica", "bold")
      doc.setFontSize(6)
      doc.text('ESCANEIE-ME', centroVersoX, yVerso + tamanhoTag - 4, { align: 'center' })

      doc.setFont("helvetica", "italic")
      doc.setFontSize(8)
      doc.text('[ Lado Traseiro / Verso ]', centroVersoX, yVerso + tamanhoTag + 8, { align: 'center' })

      doc.save(`dog-tag-${petData.name.toLowerCase()}-${formato}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar o PDF.')
    }
  }

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
          const mapsLink = `https://maps.google.com/?q=${lat},${lng}`
          
          const telefoneLimpo = pet.phone.replace(/\D/g, '')
          const mensagem = encodeURIComponent(`Olá! Encontrei seu pet ${pet.name}. Aqui está minha localização atual: ${mapsLink}`)
          const urlWhatsApp = `https://api.whatsapp.com/send?phone=55${telefoneLimpo}&text=${mensagem}`
          
          setWhatsappLink(urlWhatsApp)
          window.location.href = urlWhatsApp
        },
        () => {
          alert('Não foi possível obter sua localização. Verifique as permissões do GPS.')
        },
        { enableHighAccuracy: true, timeout: 10000 }
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

  const linkPublicoPet = `${baseUrl}/pet/${pet.id}`
  const especieAtual = (pet.species || '').toLowerCase()
  const fotoExibicao = pet.foto_url || (especieAtual.includes('gato') ? 'https://cdn-icons-png.flaticon.com/512/616/616554.png' : 'https://cdn-icons-png.flaticon.com/512/616/616408.png')

  const pagamentoAprovado = pet.is_active === true
  const isDono = isDonoReal && !modoPublicoForcado

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-12 ${pet.status === 'lost' ? 'border-t-8 border-red-500' : ''}`}>
      
      {/* ALERTA VISUAL DE PET PERDIDO */}
      {pet.status === 'lost' && (
        <div className="fixed top-0 w-full bg-red-600 border-b border-red-500 text-white font-bold py-3 text-center z-50 shadow-xl tracking-wide text-sm">
          🚨 ATENÇÃO: ESTE PET ESTÁ PERDIDO! SE VOCÊ O ENCONTROU, ENTRE EM CONTATO COM O DONO.
        </div>
      )}

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
            {pet.name}
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
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Foto do Pet</label>
              <input 
                type="file" 
                accept="image/jpeg, image/jpg, image/png"
                onChange={handleUploadFoto}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
              {enviandoFoto && <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Enviando foto...</p>}
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
          /* Informações do Pet */
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

        {/* CONTROLE DE EXIBIÇÃO: DONO X QUEM ACHOU */}
        {isDono ? (
          /* SE FOR O DONO */
          <div className="space-y-4 pt-2">
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-sm transition"
              >
                ✏️ Alterar Dados / Foto
              </button>
            )}

            {/* SE O PAGAMENTO ESTIVER APROVADO */}
            {pagamentoAprovado ? (
              <div className="space-y-4">
                
                {/* SELETOR DE FORMATO E PREVIEW COM CALIBRAÇÃO */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-3">
                  <label className="block text-xs font-semibold text-slate-400">Escolha o formato do Molde PDF:</label>
                  
                  <div className="flex gap-2">
                    <select
                      value={formatoPdf}
                      onChange={(e) => setFormatoPdf(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="osso">🦴 Formato Osso</option>
                      <option value="patinha">🐾 Formato Patinha</option>
                      <option value="circulo">⭕ Formato Círculo</option>
                    </select>

                    <button
                      onClick={() => gerarPdfTag(pet, formatoPdf)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition shadow flex items-center justify-center gap-1.5"
                    >
                      🛠️ Baixar PDF
                    </button>
                  </div>

                  {/* PREVIEW VISUAL INTERATIVO */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col items-center space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Preview & Calibração (Frente)</span>
                    
                    <div className="relative w-36 h-36 bg-white border border-slate-700 rounded-xl flex items-center justify-center overflow-hidden shadow-inner p-2">
                      <img 
                        src={`/moldes/${formatoPdf}.png`} 
                        alt="Molde Preview" 
                        className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none opacity-90"
                      />
                      <div 
                        className="relative z-10 flex flex-col items-center justify-center text-center transition-all"
                        style={{ transform: `translate(${offsetX}px, ${offsetY}px)` }}
                      >
                        <span className="font-extrabold text-slate-900 truncate max-w-[80px]" style={{ fontSize: `${fontSize}px`, textShadow: '0 0 2px #fff' }}>
                          {pet.name}
                        </span>
                        <span className="text-[6px] font-bold text-slate-700" style={{ textShadow: '0 0 2px #fff' }}>
                          DARKSTAR
                        </span>
                      </div>
                    </div>

                    {/* BOTÕES DE AJUSTE DIRETO NA TELA */}
                    <div className="w-full space-y-1.5 pt-1 text-xs">
                      <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Mover (Horizontal):</span>
                        <div className="flex gap-1">
                          <button onClick={() => setOffsetX(offsetX - 2)} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">◀</button>
                          <button onClick={() => setOffsetX(offsetX + 2)} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">▶</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Mover (Vertical):</span>
                        <div className="flex gap-1">
                          <button onClick={() => setOffsetY(offsetY - 2)} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">▲</button>
                          <button onClick={() => setOffsetY(offsetY + 2)} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">▼</button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Tamanho da Fonte:</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setFontSize(Math.max(8, fontSize - 1))} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">-</button>
                          <span className="text-slate-200 font-mono w-5 text-center">{fontSize}</span>
                          <button onClick={() => setFontSize(fontSize + 1)} className="bg-slate-800 px-2 py-0.5 rounded text-white hover:bg-slate-700">+</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-3">
                  <p className="text-xs font-semibold text-slate-400">QR Code da Plaqueta:</p>
                  
                  <div id="qr-code-svg-container" className="flex justify-center bg-white p-3 rounded-xl inline-block shadow-md">
                    <QRCodeSVG 
                      value={linkPublicoPet} 
                      size={140}
                      level="H"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button 
                      onClick={() => {
                        const container = document.getElementById('qr-code-svg-container')
                        const svgElement = container.querySelector('svg')
                        if (!svgElement) return

                        const serializer = new XMLSerializer()
                        let source = serializer.serializeToString(svgElement)

                        if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')
                        }

                        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
                        const url = URL.createObjectURL(blob)
                        
                        const link = document.createElement('a')
                        link.href = url
                        link.download = `qrcode-${pet.name.toLowerCase()}.svg`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-2 rounded-lg text-center transition shadow"
                    >
                      Baixar SVG
                    </button>

                    <button 
                      onClick={() => {
                        const container = document.getElementById('qr-code-svg-container')
                        const svgElement = container.querySelector('svg')
                        if (!svgElement) return

                        const svgData = new XMLSerializer().serializeToString(svgElement)
                        const canvas = document.createElement('canvas')
                        const ctx = canvas.getContext('2d')
                        const img = new Image()

                        img.onload = () => {
                          canvas.width = 500
                          canvas.height = 500
                          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                          
                          const pngUrl = canvas.toDataURL('image/png')
                          const link = document.createElement('a')
                          link.href = pngUrl
                          link.download = `qrcode-${pet.name.toLowerCase()}.png`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }

                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-2 rounded-lg text-center transition shadow"
                    >
                      Baixar PNG
                    </button>
                  </div>

                  <div>
                    <a 
                      href="/dashboard"
                      className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg text-center transition"
                    >
                      Painel Geral
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-center space-y-2">
                <span className="text-2xl">⏳</span>
                <h3 className="font-bold text-amber-400 text-sm">Pagamento Pendente</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O acesso ao QR Code e aos moldes PDF será liberado automaticamente assim que o pagamento de ativação for confirmado.
                </p>
              </div>
            )}

          </div>
        ) : null}

        {/* SE FOR QUEM ACHOU O PET */}
        {!isDono && (
          <div className="space-y-3">
            {pagamentoAprovado ? (
              <>
                <button
                  onClick={handleEnviarLocalizacao}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
                >
                  📍 Enviar Minha Localização
                </button>

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-lg animate-bounce"
                  >
                    📲 Clique aqui para abrir o WhatsApp com a localização
                  </a>
                )}
              </>
            ) : (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center space-y-2">
                <span className="text-xl">⚠️</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Esta plaqueta ainda não foi ativada pelo dono. O resgate via QR Code estará disponível assim que a taxa de cadastro for confirmada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Banner de Autopromoção Sutil */}
        {!isDono && (
          <div className="border-t border-slate-800/80 pt-4 mt-4 text-center">
            <p className="text-[11px] text-slate-400 mb-1">
              Gostou da plaqueta inteligente?
            </p>
            <a 
              href="/register" 
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition underline underline-offset-2"
            >
              Proteja seu pet também com a DarkStar Pets 🐾
            </a>
          </div>
        )}

      </div>
    </div>
  )
}