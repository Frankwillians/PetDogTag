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
    <div className="min-h-screen bg-[#e2e8f0] text-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      <div className="max-w-md w-full bg-[#f8fafc] border border-slate-300 p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 mb-2 text-center">Nova Senha</h1>
        <p className="text-sm text-slate-600 mb-6 text-center font-semibold">Digite sua nova senha abaixo.</p>

        {erro && (
          <div className="bg-red-100 border border-red-300 text-red-900 text-sm p-3 rounded-xl mb-4 text-center font-bold">
            {erro}
          </div>
        )}

        <form onSubmit={handleAtualizarSenha} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1.5">Nova Senha</label>
            <input
              type="password"
              placeholder="Mínimo de 6 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-semibold shadow-sm placeholder-slate-400"
              minLength={6}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-amber-600/20 text-sm mt-2"
          >
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  )
}