'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const handleRecuperar = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensagem('')
    setErro('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    })

    if (error) {
      setErro('Erro ao enviar e-mail: ' + error.message)
    } else {
      setMensagem('Tudo certo! Verifique sua caixa de entrada para o link de redefinição.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Recuperar Senha</h1>
        <p className="text-sm text-slate-400 mb-6 text-center">Informe seu e-mail cadastrado para receber as instruções.</p>
        
        {mensagem && (
          <div className="bg-emerald-950 border border-emerald-800 text-emerald-200 text-sm p-3 rounded-xl mb-4 text-center">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="bg-red-950 border border-red-800 text-red-200 text-sm p-3 rounded-xl mb-4 text-center">
            {erro}
          </div>
        )}

        <form onSubmit={handleRecuperar} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Enviando link...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Lembrou a senha?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}