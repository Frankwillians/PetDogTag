'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

// Inicializa o cliente do Supabase no front-end
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados do formulário de cadastro de pet (incluindo Peso e Idade)
  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [raca, setRaca] = useState('')
  const [peso, setPeso] = useState('')
  const [idade, setIdade] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [sucessoForm, setSucessoForm] = useState('')

  useEffect(() => {
    async function checkUserAndFetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login') // Redireciona se não estiver logado
        return
      }

      setUser(session.user)

      // Busca o perfil do usuário (Nome e Telefone salvos na conta)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileData) {
        setUserProfile(profileData)
      }

      await fetchPets(session.user.id)
      setLoading(false)
    }

    checkUserAndFetchData()
  }, [router])

  async function fetchPets(userId) {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setPets(data)
    }
  }

  // Funções de formatação automática para peso e idade
  const formatarPeso = (val) => {
    const apenasNumeros = val.replace(/[^\d.,]/g, '')
    if (!apenasNumeros) return ''
    return `${apenasNumeros} kg`
  }

  const formatarIdade = (val) => {
    const apenasNumeros = val.replace(/\D/g, '')
    if (!apenasNumeros) return ''
    const num = parseInt(apenasNumeros, 10)
    if (num === 1) return '1 ano'
    return `${num} anos`
  }

  // Função para cadastrar novo pet
  async function handleCadastrarPet(e) {
    e.preventDefault()
    setErroForm('')
    setSucessoForm('')

    if (!nome || !especie) {
      setErroForm('Preencha pelo menos o Nome e a Espécie do pet.')
      return
    }

    // Valida se o usuário preencheu o perfil com nome/telefone antes de cadastrar
    if (!userProfile?.full_name || !userProfile?.phone) {
      setErroForm('Por favor, configure seu Nome e Telefone no seu perfil antes de cadastrar um pet.')
      return
    }

    // 1. Conta quantos pets o usuário já possui no sistema
    const { count, error: countError } = await supabase
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      setErroForm('Erro ao verificar quantidade de pets: ' + countError.message)
      return
    }

    // 2. Se count for 0, este é o 1º pet (Gratuito e Ativo). Se for >= 1, os próximos nascem pendentes.
    const isPrimeiroPet = count === 0

    // Formata o peso e a idade automaticamente
    const pesoFormatado = formatarPeso(peso)
    const idadeFormatada = formatarIdade(idade)

    // 3. Insere o pet no Supabase puxando os dados do dono direto do perfil
    const { error } = await supabase.from('pets').insert([
      {
        user_id: user.id,
        name: nome,
        species: especie,
        breed: raca,
        peso: pesoFormatado,
        idade: idadeFormatada,
        owner_name: userProfile.full_name, // Puxado automaticamente do perfil
        phone: userProfile.phone,             // Puxado automaticamente do perfil
        notes: observacoes,
        is_active: isPrimeiroPet // true se for o primeiro (grátis), false se for o segundo em diante (pago)
      }
    ])

    if (error) {
      setErroForm('Erro ao cadastrar pet: ' + error.message)
    } else {
      setSucessoForm(
        isPrimeiroPet 
          ? '🐾 Pet cadastrado com sucesso! Seu 1º pet é gratuito e já está ativo!' 
          : '🐾 Pet cadastrado com sucesso! Realize o pagamento de ativação (R$ 10,00) para liberar a tag.'
      )
      // Limpa os campos do formulário do pet
      setNome('')
      setEspecie('')
      setRaca('')
      setPeso('')
      setIdade('')
      setObservacoes('')
      fetchPets(user.id)
    }
  }

  // Função para iniciar o pagamento via Checkout Pro do Mercado Pago
  async function handlePagar(petId) {
    try {
      const res = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ petId, email: user?.email })
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao gerar link de pagamento: ' + (data.error || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro na requisição de pagamento:', error)
      alert('Erro ao processar o pagamento.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] flex items-center justify-center text-slate-800">
        <p className="font-semibold">Carregando painel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-slate-800 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* CABEÇALHO */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-orange-100 backdrop-blur-md sticky top-0 z-50 bg-[#fcfbfa]/95 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-wide">🐾 DarkStar Pets</h1>
          <p className="text-xs text-slate-500 font-medium">Painel de Gerenciamento de Dog Tags Inteligentes</p>
        </div>
        <div className="flex items-center gap-4">
          {userProfile?.full_name && (
            <span className="text-xs text-slate-600 hidden md:inline font-medium">
              Olá, <strong className="text-slate-900">{userProfile.full_name}</strong>
            </span>
          )}

          <a
            href="/perfil"
            className="bg-amber-100/80 hover:bg-amber-200 border border-amber-300 text-amber-900 text-sm px-4 py-2 rounded-xl transition font-semibold"
          >
            ⚙️ Meu Perfil
          </a>

          <button
            onClick={handleLogout}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm px-4 py-2 rounded-xl transition font-semibold"
          >
            Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL (FLUIDO) */}
      <main className="w-full px-6 sm:px-12 py-10 space-y-10 flex-1">
        
        {/* Formulário de Cadastro de Pet */}
        <div className="bg-white border border-orange-200/80 p-6 sm:p-8 rounded-3xl shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2 border-b border-orange-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">🐾 Cadastrar Novo Pet</h2>
            <span className="text-xs text-slate-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-medium">
              Contato vinculado: <strong className="text-slate-900">{userProfile?.phone || 'Não cadastrado'}</strong>
            </span>
          </div>

          {(!userProfile?.full_name || !userProfile?.phone) && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-xl mb-6 text-sm font-medium">
              ⚠️ Atenção: Você precisa cadastrar seu Nome e Telefone no seu perfil para poder gerar as tags corretamente.
            </div>
          )}

          {erroForm && <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-xl mb-6 text-sm font-medium">{erroForm}</div>}
          {sucessoForm && <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl mb-6 text-sm font-medium">{sucessoForm}</div>}

          <form onSubmit={handleCadastrarPet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Pet (ex: Thor)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Espécie (ex: Cachorro, Gato)"
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Raça (Opcional)"
              value={raca}
              onChange={(e) => setRaca(e.target.value)}
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm md:col-span-2 focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            />
            
            <input
              type="text"
              placeholder="Peso (ex: 4.5)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Idade (ex: 2)"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            />

            <textarea
              placeholder="Informações extras (alergias, cuidados...)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows="3"
              className="bg-[#fcfbfa] border border-orange-200 rounded-xl px-4 py-3 text-sm md:col-span-2 focus:outline-none focus:border-amber-500 font-medium text-slate-800 placeholder-slate-400"
            ></textarea>

            <button
              type="submit"
              className="md:col-span-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-600/20"
            >
              Cadastrar Pet no Sistema 🚀
            </button>
          </form>
        </div>

        {/* Listagem de Pets */}
        <div>
          <h2 className="text-2xl font-black mb-6 text-slate-900">Meus Pets Cadastrados</h2>

          {pets.length === 0 ? (
            <p className="text-slate-500 text-sm font-medium bg-white p-6 rounded-2xl border border-orange-200/80">Nenhum pet cadastrado ainda. Cadastre acima para gerar sua Dog Tag!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pets.map((pet, index) => (
                <div key={pet.id} className="bg-white border border-orange-200/80 p-6 rounded-3xl flex flex-col justify-between shadow-md hover:border-amber-400 transition">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        pet.is_active 
                          ? (index === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200')
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {pet.is_active 
                          ? (index === 0 ? 'Ativo (Grátis)' : 'Ativo (Pago)') 
                          : 'Pendente (R$ 10,00)'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium mb-4">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                  </div>

                  <div className="space-y-2.5 mt-4">
                    {pet.is_active ? (
                      <>
                        <a
                          href={`/pet/${pet.id}`}
                          className="block w-full text-center bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-2.5 rounded-xl transition shadow"
                        >
                          Ver / Baixar QR Code
                        </a>
                        <a
                          href={`/pet/${pet.id}?public=true`}
                          className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl transition border border-slate-200"
                        >
                          Ver Página Pública
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handlePagar(pet.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-2.5 rounded-xl transition shadow"
                        >
                          Pagar Ativação (R$ 10,00)
                        </button>

                        <a
                          href={`/pet/${pet.id}?public=true`}
                          className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl transition border border-slate-200"
                        >
                          Ver Página Pública
                        </a>
                      </>
                    )}

                    <button
                      onClick={async () => {
                        const novoStatus = pet.status === 'lost' ? 'safe' : 'lost';
                        await supabase.from('pets').update({ status: novoStatus }).eq('id', pet.id);
                        window.location.reload();
                      }}
                      className={`w-full text-xs font-bold py-2.5 rounded-xl transition shadow-sm ${pet.status === 'lost' ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                    >
                      {pet.status === 'lost' ? '🚨 MARCAR COMO ENCONTRADO' : '🔍 MARCAR COMO PERDIDO'}
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="w-full px-6 sm:px-12 py-8 border-t border-orange-100 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
        <p>© 2026 DarkStar Pets. Todos os direitos reservados.</p>
        <p className="text-slate-400">Sistema seguro de recuperação de pets</p>
      </footer>

    </div>
  )
}