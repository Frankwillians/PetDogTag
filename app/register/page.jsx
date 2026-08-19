'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const handleRegister = async (e)  => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // 1. Cria a conta no Supabase Auth[cite: 7]
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: nome, phone: telefone }
      }
    })

    if (authError) {
      setErrorMsg(authError.message)
      setLoading(false)
      return
    }

    // 2. Insere/atualiza explicitamente na tabela profiles para garantir o vínculo imediato[cite: 7]
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          {
            id: authData.user.id,
            full_name: nome,
            phone: telefone,
            updated_at: new Date()
          }
        ])

      if (profileError) {
        console.error('Erro ao salvar perfil:', profileError.message)
      }
    }

    // 3. Dispara o e-mail de boas-vindas personalizado via Resend[cite: 7]
    try {
      await fetch('/api/boas-vindas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nome })
      })
    } catch (err) {
      console.error('Erro ao chamar rota de boas-vindas:', err)
    }

    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#e2e8f0] text-slate-900 flex items-center justify-center p-6 selection:bg-amber-500 selection:text-white">
      <div className="max-w-md w-full bg-[#f8fafc] border border-slate-300 p-8 rounded-3xl shadow-xl">
        
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-900">Criar Conta</h1>
          <p className="text-sm text-slate-600 mt-1 font-semibold">DarkStar Pets</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-900 text-xs rounded-xl text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1.5">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-semibold shadow-sm placeholder-slate-400"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1.5">Telefone / WhatsApp</label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-semibold shadow-sm placeholder-slate-400"
              placeholder="(00) 0000-0000"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-semibold shadow-sm placeholder-slate-400"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-slate-600 mb-1.5">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-semibold shadow-sm placeholder-slate-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-amber-600/20 transition mt-2"
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        {/* Rodapé do Card */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-600 font-semibold">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-amber-700 font-bold hover:underline">
              Faça login
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}