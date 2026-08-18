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

  // Estados do formulário de cadastro de pet (Apenas dados do animal agora)
  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [raca, setRaca] = useState('')
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
      .order('created_at', { ascending: false })

    if (!error && data) {
      setPets(data)
    }
  }

  // Função para cadastrar novo pet (Modelo Freemium + Dados do Perfil Automáticos)
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

    // 3. Insere o pet no Supabase puxando os dados do dono direto do perfil
    const { error } = await supabase.from('pets').insert([
      {
        user_id: user.id,
        name: nome,
        species: especie,
        breed: raca,
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
        window.location.href = data.url // Redireciona para o ambiente seguro do Mercado Pago
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Carregando painel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        
       {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">DarkStar Pets</h1>
            <p className="text-sm text-slate-400">Painel de Gerenciamento de Dog Tags Inteligentes</p>
          </div>
          <div className="flex items-center gap-3">
            {userProfile?.full_name && (
              <span className="text-xs text-slate-300 hidden md:inline">
                Olá, <strong className="text-indigo-300">{userProfile.full_name}</strong>
              </span>
            )}

            {/* BOTÃO ADICIONADO PARA IR AO PERFIL */}
            <a
              href="/perfil"
              className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 text-indigo-300 text-sm px-4 py-2 rounded-xl transition font-medium"
            >
              ⚙️ Meu Perfil
            </a>

            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-xl transition font-medium"
            >
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Formulário de Cadastro Simplificado (Apenas Dados do Pet) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-300">🐾 Cadastrar Novo Pet</h2>
            <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              Contato vinculado: <strong className="text-slate-200">{userProfile?.phone || 'Não cadastrado'}</strong>
            </span>
          </div>

          {(!userProfile?.full_name || !userProfile?.phone) && (
            <div className="bg-amber-950/50 border border-amber-700 text-amber-200 p-3 rounded-xl mb-4 text-sm">
              ⚠️ Atenção: Você precisa cadastrar seu Nome e Telefone no seu perfil para poder gerar as tags corretamente.
            </div>
          )}

          {erroForm && <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-xl mb-4 text-sm">{erroForm}</div>}
          {sucessoForm && <div className="bg-emerald-900/50 border border-emerald-700 text-emerald-200 p-3 rounded-xl mb-4 text-sm">{sucessoForm}</div>}

          <form onSubmit={handleCadastrarPet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Pet (ex: Thor)"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Espécie (ex: Cachorro, Gato)"
              value={especie}
              onChange={(e) => setEspecie(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Raça (Opcional)"
              value={raca}
              onChange={(e) => setRaca(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm md:col-span-2 focus:outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Informações extras (alergias, cuidados...)"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows="3"
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm md:col-span-2 focus:outline-none focus:border-indigo-500"
            ></textarea>

            <button
              type="submit"
              className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
            >
              Cadastrar Pet no Sistema
            </button>
          </form>
        </div>

        {/* Listagem de Pets */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-200">Meus Pets Cadastrados</h2>

          {pets.length === 0 ? (
            <p className="text-slate-500 text-sm">Nenhum pet cadastrado ainda. Cadastre acima para gerar sua Dog Tag!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div key={pet.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{pet.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pet.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                        {pet.is_active ? 'Ativo (Grátis)' : 'Pendente (R$ 10,00)'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {pet.is_active ? (
                      <>
                        <a
                          href={`/pet/${pet.id}`}
                          className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-xl transition"
                        >
                          Ver / Baixar QR Code
                        </a>
                        <a
                          href={`/pet/${pet.id}?public=true`}
                          className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-xl transition"
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
                          className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-xl transition"
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
                      className={`w-full text-xs font-bold py-2.5 rounded-xl transition ${pet.status === 'lost' ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                    >
                      {pet.status === 'lost' ? '🚨 MARCAR COMO ENCONTRADO' : '🔍 MARCAR COMO PERDIDO'}
                    </button>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}