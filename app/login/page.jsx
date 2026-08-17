'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('E-mail ou senha incorretos.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white">Acessar Painel</h1>
          <p className="text-sm text-slate-400 mt-1">DarkStar Dog Tags Inteligentes</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950 border border-red-800 text-red-400 text-xs rounded-xl text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-indigo-600/20 transition mt-2"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Rodapé do Card */}
        <div className="text-center mt-6 space-y-2">
          <div>
            <Link href="/recuperar-senha" className="text-xs text-indigo-400 hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Não tem uma conta?{' '}
            <a href="/register" className="text-indigo-400 font-semibold hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}