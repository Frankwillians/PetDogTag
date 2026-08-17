'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [novaSenha, setNovaSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleAtualizarSenha = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    })

    if (error) {
      setErro('Erro ao atualizar a senha: ' + error.message)
      setLoading(false)
    } else {
      alert('Senha atualizada com sucesso!')
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Nova Senha</h1>
        <p className="text-sm text-slate-400 mb-6 text-center">Digite sua nova senha abaixo.</p>

        {erro && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-sm p-3 rounded-xl mb-4 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleAtualizarSenha} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Nova Senha</label>
            <input
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}