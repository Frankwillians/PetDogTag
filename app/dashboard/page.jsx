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
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados do formulário de cadastro de pet
  const [nome, setNome] = useState('')
  const [especie, setEspecie] = useState('')
  const [raca, setRaca] = useState('')
  const [dono, setDono] = useState('')
  const [telefone, setTelefone] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erroForm, setErroForm] = useState('')
  const [sucessoForm, setSucessoForm] = useState('')

  useEffect(() => {
    async function checkUserAndFetchPets() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login') // Redireciona se não estiver logado
        return
      }

      setUser(session.user)
      await fetchPets(session.user.id)
      setLoading(false)
    }

    checkUserAndFetchPets()
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

  // Função para cadastrar novo pet
// Função para cadastrar novo pet
// Função para cadastrar novo pet
  async function handleCadastrarPet(e) {
    e.preventDefault()
    setErroForm('')
    setSucessoForm('')

    if (!nome || !especie) {
      setErroForm('Preencha pelo menos o Nome e a Espécie do pet.')
      return
    }

    // 1. VERIFICAÇÃO DO LIMITE DO PLANO GRATUITO (1 Pet Grátis)
    const { count, error: countError } = await supabase
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      setErroForm('Erro ao verificar limite de pets: ' + countError.message)
      return
    }

    // Se o usuário já tiver 1 ou mais pets cadastrados, bloqueia
    if (count >= 1) {
      setErroForm('Você atingiu o limite do plano gratuito (1 pet grátis). Para cadastrar mais pets, entre em contato para fazer um upgrade!')
      return
    }

    // 2. SE PASSOU DA VERIFICAÇÃO, CONTINUA COM O INSERT NORMAL
    const { error } = await supabase.from('pets').insert([
      {
        user_id: user.id,
        name: nome,
        species: especie,
        breed: raca,
        owner_name: dono,
        phone: telefone,
        notes: observacoes,
        is_active: false // Inicia pendente até o pagamento
      }
    ])

    if (error) {
      setErroForm('Erro ao cadastrar pet: ' + error.message)
    } else {
      setSucessoForm('Pet cadastrado com sucesso!')
      setNome('')
      setEspecie('')
      setRaca('')
      setDono('')
      setTelefone('')
      setObservacoes('')
      fetchPets(user.id)
    }
  }

  // Funçãoo para iniciar o pagamento via Checkout Pro do Mercado Pago
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
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-xl transition font-medium"
          >
            Sair da Conta
          </button>
        </div>

        {/* Formulário de Cadastro */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl mb-10">
          <h2 className="text-lg font-semibold mb-4 text-indigo-300">🐾 Cadastrar Novo Pet</h2>

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
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Seu Nome (Dono)"
              value={dono}
              onChange={(e) => setDono(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Telefone / WhatsApp com DDD"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
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
                        {pet.is_active ? 'Ativo' : 'Pendente (R$ 10,00)'}
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