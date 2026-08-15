'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function DashboardPage() {
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', species: '', breed: '', bio: '', owner_name: '', contact_phone: '' })
  const [message, setMessage] = useState('')
  const [selectedPetForQR, setSelectedPetForQR] = useState(null)

  async function fetchPets() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id)

    if (!error) setPets(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchPets()
  }, [])

  async function handleCreatePet(e) {
    e.preventDefault()
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('Você precisa estar logado para cadastrar um pet.')
      return
    }

    const { error } = await supabase.from('pets').insert([
      {
        user_id: user.id,
        name: form.name,
        species: form.species,
        breed: form.breed,
        bio: form.bio,
        owner_name: form.owner_name,
        contact_phone: form.contact_phone,
        is_active: false
      }
    ])

    if (error) {
      setMessage('Erro ao cadastrar pet: ' + error.message)
    } else {
      setMessage('Pet cadastrado com sucesso! Efetue o pagamento para liberar a tag.')
      setForm({ name: '', species: '', breed: '', bio: '', owner_name: '', contact_phone: '' })
      fetchPets()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-center border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">DarkStar Pets</h1>
            <p className="text-xs text-slate-400 mt-1">Painel de Gerenciamento de Dog Tags Inteligentes</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }}
            className="text-xs bg-slate-800 text-slate-300 px-4 py-2 rounded-xl font-semibold hover:bg-slate-700 hover:text-white transition border border-slate-700"
          >
            Sair da Conta
          </button>
        </header>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300 text-sm font-medium shadow-lg">
            {message}
          </div>
        )}

        {/* Formulário de Cadastro */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-slate-700/60">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Cadastrar Novo Pet
          </h2>
          <form onSubmit={handleCreatePet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do Pet (ex: Thor)"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Espécie (ex: Cachorro, Gato)"
              value={form.species}
              onChange={e => setForm({ ...form, species: e.target.value })}
              required
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Raça (Opcional)"
              value={form.breed}
              onChange={e => setForm({ ...form, breed: e.target.value })}
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Seu Nome (Dono)"
              value={form.owner_name}
              onChange={e => setForm({ ...form, owner_name: e.target.value })}
              required
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <input
              type="text"
              placeholder="Telefone / WhatsApp com DDD"
              value={form.contact_phone}
              onChange={e => setForm({ ...form, contact_phone: e.target.value })}
              required
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
            <textarea
              placeholder="Informações extras (alergias, cuidados...)"
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition md:col-span-2 h-24 resize-none"
            />
            <button
              type="submit"
              className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition duration-200"
            >
              Cadastrar Pet no Sistema
            </button>
          </form>
        </div>

        {/* Modal de QR Code */}
        {selectedPetForQR && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-1">QR Code: {selectedPetForQR.name}</h3>
              <p className="text-xs text-slate-400 mb-6">Escaneie para testar o sistema de resgate</p>
              
              <div className="flex justify-center bg-white p-4 rounded-xl shadow-inner mb-4">
                <QRCodeSVG
                  value={`${window.location.origin}/pet/${selectedPetForQR.id}`}
                  size={190}
                  level={"H"}
                  includeMargin={true}
                />
              </div>

              <p className="text-xs text-slate-400 mb-6 truncate bg-slate-900/60 p-2 rounded-lg border border-slate-700/50">
                {window.location.origin}/pet/{selectedPetForQR.id}
              </p>

              <button
                onClick={() => setSelectedPetForQR(null)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Pets */}
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Meus Pets Cadastrados
        </h2>

        {loading ? (
          <p className="text-slate-400">Carregando seus pets...</p>
        ) : pets.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            Nenhum pet cadastrado no momento. Use o formulário acima para começar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map(pet => (
              <div key={pet.id} className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex flex-col justify-between hover:border-slate-600 transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{pet.name}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold tracking-wide ${pet.is_active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-amber-950 text-amber-400 border border-amber-800/50'}`}>
                      {pet.is_active ? 'Ativo' : 'Pendente (R$ 10)'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-700/60 flex flex-col gap-2">
                  {pet.is_active ? (
                    <button
                      onClick={() => setSelectedPetForQR(pet)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow transition"
                    >
                      Ver / Baixar QR Code
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const { data: { user } } = await supabase.auth.getUser()
                        const res = await fetch('/api/pagamento', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ petId: pet.id, email: user.email })
                        })
                        const data = await res.json()
                        if (data.qr_code) {
                          navigator.clipboard.writeText(data.qr_code)
                          alert("Código Pix Copia e Cola gerado e copiado para a área de transferência! (Valor: R$ 10,00)")
                        } else {
                          alert("Erro ao gerar pagamento: " + JSON.stringify(data))
                        }
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-2.5 rounded-xl text-sm font-bold shadow transition"
                    >
                      Pagar Pix Ativação (R$ 10,00)
                    </button>
                  )}

                  <a
                    href={`/pet/${pet.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white text-center py-2.5 rounded-xl text-sm font-semibold transition border border-slate-700"
                  >
                    Ver Página Pública
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}