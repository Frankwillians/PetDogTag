'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Perfil() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Busca os dados do perfil existente[cite: 6]
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }

      setLoading(false)
    }

    loadProfile()
  }, [router])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setMensagem('')
    setErro('')

    if (!fullName || !phone) {
      setErro('Por favor, preencha o nome e o telefone.')
      return
    }

    // 1. Atualiza o perfil principal do usuário[cite: 6]
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date()
      })
      .eq('id', user.id)

    if (profileError) {
      setErro('Erro ao atualizar perfil: ' + profileError.message)
      return
    }

    // 2. Atualiza automaticamente o nome e o telefone em TODOS os pets já cadastrados por este usuário[cite: 6]
    const { error: petsError } = await supabase
      .from('pets')
      .update({
        owner_name: fullName,
        phone: phone
      })
      .eq('user_id', user.id)

    if (petsError) {
      setErro('Perfil salvo, mas houve um erro ao atualizar os pets antigos: ' + petsError.message)
    } else {
      setMensagem('Perfil e tags de pets atualizados com sucesso!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e2e8f0] flex items-center justify-center text-slate-800">
        <p className="font-semibold">Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#e2e8f0] text-slate-900 p-6 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      <div className="max-w-xl mx-auto w-full">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-300 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Meu Perfil</h1>
            <p className="text-sm text-slate-600 font-semibold">Gerencie seus dados de contato para as Dog Tags</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-slate-100 text-slate-800 text-sm px-4 py-2.5 rounded-xl transition font-bold border border-slate-300 shadow-sm"
          >
            Voltar ao Painel
          </Link>
        </div>

        {/* Formulário de Perfil */}
        <div className="bg-[#f8fafc] border border-slate-300 p-8 rounded-3xl shadow-xl">
          <h2 className="text-lg font-bold mb-6 text-slate-900">👤 Informações do Dono</h2>

          {erro && <div className="bg-red-100 border border-red-300 text-red-900 p-4 rounded-xl mb-6 text-sm font-bold">{erro}</div>}
          {mensagem && <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-xl mb-6 text-sm font-bold">{mensagem}</div>}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">E-mail da Conta</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-200/70 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Seu Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-sm placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Telefone / WhatsApp Principal</label>
              <input
                type="text"
                placeholder="Ex: (55) 0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-semibold focus:outline-none focus:border-amber-500 shadow-sm placeholder-slate-400"
              />
              <p className="text-xs text-slate-600 mt-1.5 font-medium">Este número aparecerá nas páginas públicas dos seus pets caso alguém escaneie a Dog Tag.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-600/20 mt-4 text-sm"
            >
              Salvar Alterações 🚀
            </button>
          </form>
        </div>

      </div>

      {/* Rodapé */}
      <footer className="w-full text-center text-xs text-slate-600 font-bold pt-8">
        <p>© 2026 DarkStar Pets. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}