'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER / TOPO */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-extrabold text-xl text-white tracking-wide">DarkStar Dog Tags</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition">
            Entrar
          </Link>
          <Link href="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition">
            Criar Conta
          </Link>
        </div>
      </header>

      {/* HERO SECTION (DESTAQUE PRINCIPAL) */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner">
          ✨ Segurança e Tecnologia para seu Pet a Custo Zero de Envio
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Perdeu o pet? Quem achar te avisa pelo <span className="text-indigo-500">WhatsApp em 1 clique!</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Crie sua plaqueta inteligente com QR Code em segundos. Baixe o molde em PDF pronto para imprimir em casa, cole na coleira e garanta localização GPS instantânea se ele se perder.
        </p>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition"
          >
            Cadastrar Meu Pet Agora 🚀
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-base px-8 py-4 rounded-2xl transition"
          >
            Já tenho uma conta
          </Link>
        </div>

        {/* COMO FUNCIONA (3 PASSOS) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="text-2xl">1️⃣</div>
            <h3 className="font-bold text-white text-lg">Cadastre o Pet</h3>
            <p className="text-sm text-slate-400">Insira o nome, seu WhatsApp de contato, envie a foto e os dados principais de segurança.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="text-2xl">2️⃣</div>
            <h3 className="font-bold text-white text-lg">Baixe e Imprima</h3>
            <p className="text-sm text-slate-400">Gere o PDF exclusivo do molde dobrável com a foto e o QR Code prontos para imprimir na sua impressora.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="text-2xl">3️⃣</div>
            <h3 className="font-bold text-white text-lg">Proteção Ativa</h3>
            <p className="text-sm text-slate-400">Se alguém escanear a tag na rua, o celular abre o seu WhatsApp com a localização exata do GPS.</p>
          </div>

        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        © 2026 DarkStar Dog Tags Inteligentes. Todos os direitos reservados.
      </footer>

    </div>
  )
}