'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleAuth(e) {
    e.preventDefault()
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage('Erro ao cadastrar: ' + error.message)
      } else {
        setMessage('Conta criada com sucesso! Verifique seu e-mail ou faça login.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('Erro ao entrar: ' + error.message)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
          {isSignUp ? 'Criar Conta' : 'Acessar Painel'}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">DarkStar Dog Tags Inteligentes</p>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl shadow hover:bg-amber-700 transition"
          >
            {isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-amber-600 font-semibold hover:underline"
          >
            {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  )
}