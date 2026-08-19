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
  const [peso, setPeso] = useState('')
  const [idade, setIdade] = useState('')
  const [notes, setNotes] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  
  const [formatoPdf, setFormatoPdf] = useState('circular')
  
  // Cores personalizáveis para a plaqueta
  const [corBorda, setCorBorda] = useState('#1e3a8a')       
  const [corInterna, setCorInterna] = useState('#fbbf24')   
  const [corTexto, setCorTexto] = useState('#0f172a')       
  
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
      setPeso(petData.peso || '')
      setIdade(petData.idade || '')
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
      .update({ name: nome, peso: peso, idade: idade, notes: notes, foto_url: fotoUrl })
      .eq('id', petId)

    if (error) {
      alert('Erro ao atualizar os dados do pet.')
    } else {
      alert('Dados atualizados com sucesso!')
      setPet({ ...pet, name: nome, peso, idade, notes: notes, foto_url: fotoUrl })
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

  const gerarPdfTag = async (petData, formato) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const currentDomain = window.location.origin
    const linkDinamico = `${currentDomain}/pet/${petData.id}?public=true`

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Molde DarkStar Pets (${formato.toUpperCase()}) - ${petData.name}`, 15, 15)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(`Contato: ${petData.phone} | Escaneie para ver o perfil de emergência`, 15, 21)

    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.replace('#', ''), 16)
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
    }

    const [rBorda, gBorda, bBorda] = hexToRgb(corBorda)
    const [rInt, gInt, bInt] = hexToRgb(corInterna)
    const [rTxt, gTxt, bTxt] = hexToRgb(corTexto)

    if (formato === 'circular') {
      doc.setFillColor(rBorda, gBorda, bBorda)
      doc.circle(48, 57, 13, 'F')
      doc.circle(122, 57, 13, 'F')

      doc.setFillColor(rInt, gInt, bInt)
      doc.circle(48, 57, 10.5, 'F')
      doc.circle(122, 57, 10.5, 'F')

      doc.setFillColor(255, 255, 255)
      doc.circle(48, 43, 1, 'FD')
      doc.circle(122, 43, 1, 'FD')
    } else {
      doc.setFillColor(rBorda, gBorda, bBorda)
      doc.roundedRect(30.5, 44.5, 35, 25, 3, 3, 'F')
      doc.roundedRect(104.5, 44.5, 35, 25, 3, 3, 'F')

      doc.setFillColor(rInt, gInt, bInt)
      doc.roundedRect(32.5, 46.5, 31, 21, 2, 2, 'F')
      doc.roundedRect(106.5, 46.5, 31, 21, 2, 2, 'F')

      doc.setFillColor(255, 255, 255)
      doc.circle(48, 41.5, 1, 'FD')
      doc.circle(122, 41.5, 1, 'FD')
    }

    const xFrenteCentro = 48
    const yFrenteCentro = 57

    doc.setFont("helvetica", "bold")
    doc.setFontSize(formato === 'circular' ? 10 : 11)
    doc.setTextColor(rTxt, gTxt, bTxt) 
    doc.text(petData.name, xFrenteCentro, yFrenteCentro + 1, { align: 'center' })

    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(40, 40, 40)
    doc.text('[ Lado Frontal ]', 48, 87, { align: 'center' })

    doc.setLineDash([1.5, 1.5], 0)
    doc.line(85, 25, 85, 95)
    doc.setLineDash([], 0)

    const xVersoCentro = 122
    const yVersoCentro = 57

    const toBase64 = async (url) => {
      try {
        const response = await fetch(url, { mode: 'cors' })
        if (!response.ok) throw new Error()
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      } catch (e) {
        return null
      }
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(linkDinamico)}`

    try {
      const base64Qr = await toBase64(qrUrl)
      if (base64Qr) {
        const tamanhoQr = formato === 'circular' ? 15 : 16
        doc.addImage(base64Qr, 'PNG', xVersoCentro - (tamanhoQr / 2), yVersoCentro - (tamanhoQr / 2), tamanhoQr, tamanhoQr)
      }

      doc.setFont("helvetica", "italic")
      doc.setFontSize(8)
      doc.setTextColor(40, 40, 40)
      doc.text('[ Lado Traseiro / Verso ]', 122, 87, { align: 'center' })

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
      <div className="min-h-screen bg-[#eef1f5] text-slate-800 flex items-center justify-center">
        <p className="text-sm font-semibold animate-pulse">Carregando informações...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-[#eef1f5] text-slate-800 flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-slate-300 p-8 rounded-3xl shadow-md max-w-sm w-full">
          <h1 className="text-xl font-bold text-red-600 mb-2">Pet não encontrado</h1>
          <p className="text-sm text-slate-600">Verifique o link ou entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  const linkPublicoPet = `${baseUrl}/pet/${pet.id}?public=true`
  const especieAtual = (pet.species || '').toLowerCase()
  const fotoExibicao = pet.foto_url || (especieAtual.includes('gato') ? 'https://cdn-icons-png.flaticon.com/512/616/616554.png' : 'https://cdn-icons-png.flaticon.com/512/616/616408.png')

  const pagamentoAprovado = pet.is_active === true
  const isDono = isDonoReal && !modoPublicoForcado

  return (
    <div className={`min-h-screen bg-[#eef1f5] text-slate-900 flex flex-col items-center justify-between p-4 py-12 selection:bg-amber-500 selection:text-white ${pet.status === 'lost' ? 'border-t-8 border-red-600' : ''}`}>
      
      {pet.status === 'lost' && (
        <div className="fixed top-0 w-full bg-red-600 border-b border-red-500 text-white font-bold py-3 text-center z-50 shadow-xl tracking-wide text-sm">
          🚨 ATENÇÃO: ESTE PET ESTÁ PERDIDO! SE VOCÊ O ENCONTROU, ENTRE EM CONTATO COM O DONO.
        </div>
      )}

      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center py-6">
        <div className="w-full bg-white border border-slate-200/90 p-8 rounded-3xl shadow-xl space-y-6">
          
          {/* CABEÇALHO */}
          <div className="text-center space-y-3">
            <div className="inline-block bg-slate-100 border border-slate-300 text-slate-800 text-xs font-extrabold px-4 py-1.5 rounded-full shadow-inner tracking-wide">
              {isDono ? '🛡️ PAINEL DO DONO' : '🐾 PERFIL DE EMERGÊNCIA'}
            </div>

            <div className="flex justify-center">
              <img src={fotoExibicao} alt={pet.name} className="w-32 h-32 object-cover rounded-full border-4 border-slate-200 shadow-xl bg-slate-100 p-1" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{pet.name}</h1>
              <p className="text-sm font-semibold text-slate-600 capitalize mt-0.5">
                {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
              </p>
            </div>
          </div>

          {/* SE FOR O DONO E ESTIVER EDITANDO OS DADOS */}
          {isDono && editando ? (
            <form onSubmit={handleSalvarAlteracoes} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h2 className="text-xs font-bold uppercase text-slate-700 mb-2">Editar Dados do Pet</h2>
              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Nome do Pet</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Peso</label>
                  <input 
                    type="text" 
                    value={peso} 
                    onChange={(e) => setPeso(e.target.value)} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-700"
                    placeholder="Ex: 4.5kg"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Idade</label>
                  <input 
                    type="text" 
                    value={idade} 
                    onChange={(e) => setIdade(e.target.value)} 
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-700"
                    placeholder="Ex: 2 anos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Foto do Pet</label>
                <input 
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={handleUploadFoto}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-medium file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
                {enviandoFoto && <p className="text-xs text-slate-700 mt-1 font-semibold animate-pulse">Enviando foto...</p>}
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-slate-600 mb-1">Cuidados / Alergias</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:border-slate-700"
                  rows="2"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition shadow">
                  Salvar
                </button>
                <button type="button" onClick={() => setEditando(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition">
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            /* BLOCO DE INFORMAÇÕES COM LISTA EM LINHAS E ÍCONES */
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-sm shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5">👤 Tutor responsável:</span>
                  <span className="text-slate-900 font-bold">{pet.owner_name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5">📱 WhatsApp:</span>
                  <span className="text-slate-900 font-bold">{pet.phone || 'Não informado'}</span>
                </div>

                {pet.peso && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5">⚖️ Peso:</span>
                    <span className="text-slate-900 font-bold">{pet.peso}</span>
                  </div>
                )}

                {pet.idade && (
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-slate-600 font-semibold text-xs flex items-center gap-1.5">🎂 Idade:</span>
                    <span className="text-slate-900 font-bold">{pet.idade}</span>
                  </div>
                )}

                {pet.notes && (
                  <div className="pt-1">
                    <span className="text-slate-600 font-semibold text-xs block mb-1">⚠️ Cuidados especiais / Alergias:</span>
                    <p className="text-slate-800 bg-white border border-slate-200 p-3 rounded-xl text-xs leading-relaxed font-medium">{pet.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CONTROLE DE EXIBIÇÃO: DONO X QUEM ACHOU */}
          {isDono ? (
            <div className="space-y-4 pt-1">
              {!editando && (
                <button
                  onClick={() => setEditando(true)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 rounded-2xl text-sm transition border border-slate-200 shadow-sm"
                >
                  ✏️ Alterar Dados / Foto
                </button>
              )}

              {pagamentoAprovado ? (
                <div className="space-y-4">
                  
                  {/* PERSONALIZAÇÃO DE CORES COM BORDA PREENCHIDA E PREVIEW AO VIVO */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-4">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">Personalize sua Plaqueta:</label>
                    
                    <div className="flex gap-2">
                      <select
                        value={formatoPdf}
                        onChange={(e) => setFormatoPdf(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-700 font-bold shadow-sm"
                      >
                        <option value="circular">🪙 Circular (26mm)</option>
                        <option value="retangular">🪪 Retangular</option>
                      </select>
                    </div>

                    {/* PAINEL DE SELEÇÃO DE CORES */}
                    <div className="grid grid-cols-3 gap-2 bg-white p-3.5 rounded-2xl border border-slate-200 text-left shadow-sm">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">Borda Externa</span>
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={corBorda} onChange={(e) => setCorBorda(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-[10px] font-mono font-bold text-slate-700">{corBorda}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">Fundo Interno</span>
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={corInterna} onChange={(e) => setCorInterna(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-[10px] font-mono font-bold text-slate-700">{corInterna}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">Cor do Nome</span>
                        <div className="flex items-center gap-1.5">
                          <input type="color" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                          <span className="text-[10px] font-mono font-bold text-slate-700">{corTexto}</span>
                        </div>
                      </div>
                    </div>

                    {/* PREVIEW AO VIVO DA FRENTE DA TAG */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-600 uppercase font-bold block">Preview ao Vivo (Frente)</span>
                      <div className="w-32 h-32 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-sm">
                        <div 
                          className={`w-24 h-24 flex flex-col items-center justify-center shadow-md transition-all ${formatoPdf === 'circular' ? 'rounded-full' : 'rounded-lg'}`}
                          style={{ backgroundColor: corBorda }}
                        >
                          <div 
                            className={`w-[80%] h-[80%] flex items-center justify-center ${formatoPdf === 'circular' ? 'rounded-full' : 'rounded-md'}`}
                            style={{ backgroundColor: corInterna }}
                          >
                            <span className="text-xs font-black truncate max-w-[60px]" style={{ color: corTexto }}>
                              {pet.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => gerarPdfTag(pet, formatoPdf)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-lg shadow-slate-900/20 flex items-center justify-center gap-1.5"
                    >
                      🛠️ Baixar PDF Personalizado
                    </button>
                  </div>

                  {/* QR CODE DA PLAQUETA + BOTÕES SVG E PNG */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-3.5">
                    <p className="text-xs font-bold text-slate-800">QR Code da Plaqueta:</p>
                    
                    <div className="flex justify-center">
                      <div id="qr-code-svg-container" className="relative inline-block bg-white p-3.5 rounded-2xl shadow-md border border-slate-200">
                        <QRCodeSVG 
                          value={linkPublicoPet} 
                          size={140}
                          level="H"
                        />
                      </div>
                    </div>

                    {/* BOTÕES DE DOWNLOAD SVG E PNG */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
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
                        className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-3 px-2 rounded-xl text-center transition border border-slate-300 shadow-sm"
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
                        className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold py-3 px-2 rounded-xl text-center transition border border-slate-300 shadow-sm"
                      >
                        Baixar PNG
                      </button>
                    </div>

                    <div>
                      <a 
                        href="/dashboard"
                        className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl text-center transition shadow-md shadow-slate-900/20"
                      >
                        Painel Geral
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-300 p-5 rounded-2xl text-center space-y-2">
                  <span className="text-2xl">⏳</span>
                  <h3 className="font-bold text-amber-900 text-sm">Pagamento Pendente</h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    O acesso ao QR Code e aos moldes PDF será liberado assim que o pagamento de ativação for confirmado.
                  </p>
                </div>
              )}

            </div>
          ) : null}

          {/* SE FERNANDO / QUEM ACHOU O PET (PÁGINA PÚBLICA) */}
          {!isDono && (
            <div className="space-y-3.5 pt-2">
              {pagamentoAprovado ? (
                <>
                  <button
                    onClick={handleEnviarLocalizacao}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    📍 Enviar Minha Localização
                  </button>

                  {whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl text-sm transition shadow-lg animate-bounce"
                    >
                      📲 Clique aqui para abrir o WhatsApp com a localização
                    </a>
                  )}
                </>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-center space-y-2 shadow-sm">
                  <span className="text-xl">⚠️</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Esta plaqueta ainda não foi ativada pelo dono. O resgate via QR Code estará disponível assim que a taxa de cadastro for confirmada.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* BANNER DE AUTOPROMOÇÃO SUTIL PARA QUEM ESCANEIA */}
          {!isDono && (
            <div className="border-t border-slate-200 pt-4 mt-2 text-center">
              <p className="text-[11px] text-slate-600 mb-1 font-medium">
                Gostou da plaqueta inteligente?
              </p>
              <a 
                href="/register" 
                className="text-xs font-bold text-slate-900 hover:text-slate-700 transition underline underline-offset-2"
              >
                Proteja seu pet também com a DarkStar Pets 🐾
              </a>
            </div>
          )}

        </div>
      </div>

      {/* RODAPÉ SIMPLES */}
      <footer className="w-full px-6 py-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 DarkStar Pets. Todos os direitos reservados.</p>
      </footer>

    </div>
  )
}