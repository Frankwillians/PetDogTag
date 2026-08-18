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

      // Busca os dados do perfil existente
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
      setErroError('Por favor, preencha o nome e o telefone.')
      return
    }

    // Atualiza ou insere o perfil no Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date()
      })
      .eq('id', user.id)

    if (error) {
      setErro('Erro ao atualizar perfil: ' + error.message)
    } else {
      setMensagem('Perfil atualizado com sucesso!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Carregando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-xl mx-auto">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-indigo-400">Meu Perfil</h1>
            <p className="text-sm text-slate-400">Gerencie seus dados de contato para as Dog Tags</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-xl transition font-medium"
          >
            Voltar ao Painel
          </Link>
        </div>

        {/* Formulário de Perfil */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4 text-indigo-300">👤 Informações do Dono</h2>

          {erro && <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-xl mb-4 text-sm">{erro}</div>}
          {mensagem && <div className="bg-emerald-900/50 border border-emerald-700 text-emerald-200 p-3 rounded-xl mb-4 text-sm">{mensagem}</div>}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">E-mail da Conta</label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Seu Nome Completo</label>
              <input
                type="text"
                placeholder="Ex: Frank Willians"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Telefone / WhatsApp Principal</label>
              <input
                type="text"
                placeholder="Ex: (83) 98667-0602"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 mt-1">Este número aparecerá nas páginas públicas dos seus pets caso alguém escaneie a Dog Tag.</p>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 mt-2"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}