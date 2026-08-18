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
  const [peso, setPeso] = useState('')
  const [idade, setIdade] = useState('')
  const [notes, setNotes] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  
  const [formatoPdf, setFormatoPdf] = useState('circular')
  
  // Cores personalizáveis: Borda externa preenchida, Fundo interno e Letra do nome
  const [corBorda, setCorBorda] = useState('#dc2626')       // Cor da borda externa (ex: Vermelho)
  const [corInterna, setCorInterna] = useState('#facc15')   // Cor do preenchimento interno (ex: Amarelo)
  const [corTexto, setCorTexto] = useState('#1d4ed8')       // Cor da letra do nome (ex: Azul)
  
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
      .update({ name: nome, phone: telefone, peso: peso, idade: idade, notes: notes, foto_url: fotoUrl })
      .eq('id', petId)

    if (error) {
      alert('Erro ao atualizar os dados do pet.')
    } else {
      alert('Dados atualizados com sucesso!')
      setPet({ ...pet, name: nome, phone: telefone, peso, idade, notes: notes, foto_url: fotoUrl })
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

  // GERADOR DE PDF COM BORDA EXTERNA PREENCHIDA
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
      // 1. Círculo externo preenchido (Borda colorida)
      doc.setFillColor(rBorda, gBorda, bBorda)
      doc.circle(48, 57, 13, 'F')
      doc.circle(122, 57, 13, 'F')

      // 2. Círculo interno preenchido (Fundo da tag)
      doc.setFillColor(rInt, gInt, bInt)
      doc.circle(48, 57, 10.5, 'F')
      doc.circle(122, 57, 10.5, 'F')

      // Furo da argola (Preenchido com a cor interna ou branco para destacar)
      doc.setFillColor(255, 255, 255)
      doc.circle(48, 43, 1, 'FD')
      doc.circle(122, 43, 1, 'FD')
    } else {
      // Retangular Externo
      doc.setFillColor(rBorda, gBorda, bBorda)
      doc.roundedRect(30.5, 44.5, 35, 25, 3, 3, 'F')
      doc.roundedRect(104.5, 44.5, 35, 25, 3, 3, 'F')

      // Retangular Interno
      doc.setFillColor(rInt, gInt, bInt)
      doc.roundedRect(32.5, 46.5, 31, 21, 2, 2, 'F')
      doc.roundedRect(106.5, 46.5, 31, 21, 2, 2, 'F')

      doc.setFillColor(255, 255, 255)
      doc.circle(48, 41.5, 1, 'FD')
      doc.circle(122, 41.5, 1, 'FD')
    }

    // ================= FRENTE (Nome do Pet) =================
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

    // Linha pontilhada divisória
    doc.setLineDash([1.5, 1.5], 0)
    doc.line(85, 25, 85, 95)
    doc.setLineDash([], 0)

    // ================= VERSO (QR Code) =================
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Carregando informações...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-red-400 mb-2">Pet não encontrado</h1>
          <p className="text-sm text-slate-400">Verifique o link ou entre em contato com o suporte.</p>
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
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 py-12 ${pet.status === 'lost' ? 'border-t-8 border-red-500' : ''}`}>
      
      {pet.status === 'lost' && (
        <div className="fixed top-0 w-full bg-red-600 border-b border-red-500 text-white font-bold py-3 text-center z-50 shadow-xl tracking-wide text-sm">
          🚨 ATENÇÃO: ESTE PET ESTÁ PERDIDO! SE VOCÊ O ENCONTROU, ENTRE EM CONTATO COM O DONO.
        </div>
      )}

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl space-y-6">
        
        {/* CABEÇALHO */}
        <div className="text-center space-y-3">
          <div className="inline-block bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 text-xs font-semibold px-3.5 py-1 rounded-full">
            {isDono ? '🛡️ PAINEL DO DONO' : '🐾 PERFIL DE EMERGÊNCIA'}
          </div>

          <div className="flex justify-center">
            <img src={fotoExibicao} alt={pet.name} className="w-28 h-28 object-cover rounded-full border-4 border-indigo-500/30 shadow-xl bg-slate-950 p-1" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">{pet.name}</h1>
            <p className="text-sm text-slate-400 capitalize mt-0.5">
              {pet.species} {pet.breed ? `• ${pet.breed}` : ''}
            </p>
          </div>
        </div>

        {/* SE FOR O DONO E ESTIVER EDITANDO OS DADOS */}
        {isDono && editando ? (
          <form onSubmit={handleSalvarAlteracoes} className="space-y-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold uppercase text-indigo-400 mb-2">Editar Dados do Pet</h2>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Nome do Pet</label>
              <input 
                type="text" 
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Peso</label>
                <input 
                  type="text" 
                  value={peso} 
                  onChange={(e) => setPeso(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: 4.5kg"
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Idade</label>
                <input 
                  type="text" 
                  value={idade} 
                  onChange={(e) => setIdade(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="Ex: 2 anos"
                />
              </div>
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
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Foto do Pet</label>
              <input 
                type="file" 
                accept="image/jpeg, image/jpg, image/png"
                onChange={handleUploadFoto}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
              />
              {enviandoFoto && <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">Enviando foto...</p>}
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Cuidados / Alergias</label>
              <textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                rows="2"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition">
                Salvar
              </button>
              <button type="button" onClick={() => setEditando(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-xs transition">
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          /* BLOCO DE INFORMAÇÕES */
          <div className="space-y-3">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-sm shadow-inner">
              <div className="flex justify-between border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400 font-medium text-xs">Tutor responsável:</span>
                <span className="text-slate-100 font-bold">{pet.owner_name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-400 font-medium text-xs">WhatsApp:</span>
                <span className="text-slate-100 font-bold">{pet.phone || 'Não informado'}</span>
              </div>

              {(pet.peso || pet.idade) && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {pet.peso && (
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Peso</span>
                      <span className="text-sm font-extrabold text-indigo-400">{pet.peso}</span>
                    </div>
                  )}
                  {pet.idade && (
                    <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Idade</span>
                      <span className="text-sm font-extrabold text-indigo-400">{pet.idade}</span>
                    </div>
                  )}
                </div>
              )}

              {pet.notes && (
                <div className="pt-1">
                  <span className="text-slate-400 font-medium text-xs block mb-1">Cuidados especiais / Alergias:</span>
                  <p className="text-slate-300 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs leading-relaxed">{pet.notes}</p>
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
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-2xl text-sm transition shadow-md"
              >
                ✏️ Alterar Dados / Foto
              </button>
            )}

            {pagamentoAprovado ? (
              <div className="space-y-4">
                
                {/* PERSONALIZAÇÃO DE CORES COM BORDA PREENCHIDA E PREVIEW AO VIVO */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-center space-y-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Personalize sua Plaqueta:</label>
                  
                  <div className="flex gap-2">
                    <select
                      value={formatoPdf}
                      onChange={(e) => setFormatoPdf(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="circular">🪙 Circular (26mm)</option>
                      <option value="retangular">🪪 Retangular</option>
                    </select>
                  </div>

                  {/* PAINEL DE SELEÇÃO DE CORES (BORDA EXTERNA, INTERNO E TEXTO) */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-left">
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">Borda Externa</span>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={corBorda} onChange={(e) => setCorBorda(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                        <span className="text-[10px] font-mono text-slate-300">{corBorda}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">Fundo Interno</span>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={corInterna} onChange={(e) => setCorInterna(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                        <span className="text-[10px] font-mono text-slate-300">{corInterna}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-1">Cor do Nome</span>
                      <div className="flex items-center gap-1.5">
                        <input type="color" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} className="w-6 h-6 rounded cursor-pointer bg-transparent border-0" />
                        <span className="text-[10px] font-mono text-slate-300">{corTexto}</span>
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW AO VIVO DA FRENTE DA TAG COM A BORDA PREENCHIDA */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Preview ao Vivo (Frente)</span>
                    <div className="w-32 h-32 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-inner">
                      <div 
                        className={`w-24 h-24 flex flex-col items-center justify-center shadow-md transition-all ${formatoPdf === 'circular' ? 'rounded-full' : 'rounded-lg'}`}
                        style={{ backgroundColor: corBorda }}
                      >
                        <div 
                          className={`w-18 h-18 w-[80%] h-[80%] flex items-center justify-center ${formatoPdf === 'circular' ? 'rounded-full' : 'rounded-md'}`}
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
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                  >
                    🛠️ Baixar PDF Personalizado
                  </button>
                </div>

                {/* QR CODE DA PLAQUETA + BOTÕES SVG E PNG */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl text-center space-y-3">
                  <p className="text-xs font-semibold text-slate-400">QR Code da Plaqueta:</p>
                  
                  <div className="flex justify-center">
                    <div id="qr-code-svg-container" className="relative inline-block bg-white p-3 rounded-2xl shadow-lg">
                      <QRCodeSVG 
                        value={linkPublicoPet} 
                        size={140}
                        level="H"
                      />
                    </div>
                  </div>

                  {/* BOTÕES DE DOWNLOAD SVG E PNG */}
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
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-2 rounded-xl text-center transition shadow"
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
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-2 rounded-xl text-center transition shadow"
                    >
                      Baixar PNG
                    </button>
                  </div>

                  <div>
                    <a 
                      href="/dashboard"
                      className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl text-center transition shadow-md shadow-indigo-600/20"
                    >
                      Painel Geral
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl text-center space-y-2">
                <span className="text-2xl">⏳</span>
                <h3 className="font-bold text-amber-400 text-sm">Pagamento Pendente</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O acesso ao QR Code e aos moldes PDF será liberado assim que o pagamento de ativação for confirmado.
                </p>
              </div>
            )}

          </div>
        ) : null}

        {/* SE FOR QUEM ACHOU O PET (PÁGINA PÚBLICA) */}
        {!isDono && (
          <div className="space-y-3 pt-2">
            {pagamentoAprovado ? (
              <>
                <button
                  onClick={handleEnviarLocalizacao}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-2xl text-sm shadow-xl shadow-red-600/30 transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  📍 Enviar Minha Localização
                </button>

                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-sm transition shadow-lg animate-bounce"
                  >
                    📲 Clique aqui para abrir o WhatsApp com a localização
                  </a>
                )}
              </>
            ) : (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
                <span className="text-xl">⚠️</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Esta plaqueta ainda não foi ativada pelo dono. O resgate via QR Code estará disponível assim que a taxa de cadastro for confirmada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* BANNER DE AUTOPROMOÇÃO SUTIL PARA QUEM ESCANEIA */}
        {!isDono && (
          <div className="border-t border-slate-800/80 pt-4 mt-2 text-center">
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