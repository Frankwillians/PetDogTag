'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER / TOPO */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/50 backdrop-blur-md sticky top-0 z-50 bg-slate-950/80">
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
      <main className="max-w-5xl w-full mx-auto px-6 py-16 text-center space-y-10">
        
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner animate-pulse">
          🛡️ Prevenção e Segurança Inteligente para Pets
        </div>

        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.1]">
          Proteja o seu pet com uma <span className="text-indigo-500 underline decoration-indigo-500/30">plaqueta inteligente.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Evite sustos. Crie uma tag com QR Code em segundos e imprima em casa. Se ele escapar, quem o encontrar escaneia a coleira e envia a <strong>localização exata do GPS direto no seu WhatsApp</strong>.
        </p>

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            Proteger Meu Pet Agora 🚀
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-lg px-8 py-4 rounded-2xl transition"
          >
            Acessar Minha Conta
          </Link>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS / CONFIANÇA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 max-w-3xl mx-auto text-center">
          <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">100%</p>
            <p className="text-xs text-slate-400">Prático e Preventivo</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">Zero</p>
            <p className="text-xs text-slate-400">Custo de Frete (Imprima em Casa)</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">24/7</p>
            <p className="text-xs text-slate-400">Proteção Ativa na Coleira</p>
          </div>
        </div>

        {/* COMO FUNCIONA (3 PASSOS) */}
        <div className="pt-16 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Como funciona em 3 passos simples</h2>
            <p className="text-sm text-slate-400">Tudo pronto em menos de 2 minutos.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            
            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">01</div>
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-white text-lg">Cadastre o Pet</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Insira o nome, sua foto, o WhatsApp de contato e os cuidados essenciais de saúde.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">02</div>
              <div className="text-2xl">🖨️</div>
              <h3 className="font-bold text-white text-lg">Baixe o Molde PDF</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Gere o PDF dobrável com o QR Code e imprima na impressora de casa ou na gráfica rápida.</p>
            </div>

            <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">03</div>
              <div className="text-2xl">📍</div>
              <h3 className="font-bold text-white text-lg">Segurança Ativa</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Se alguém achar o animal, aponta a câmera, lê o QR code e o seu WhatsApp recebe a localização GPS instantânea.</p>
            </div>

          </div>
        </div>

        {/* SEÇÃO DE CHAMADA FINAL (CTA) */}
        <div className="pt-16 pb-8">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/50 p-8 sm:p-12 rounded-3xl space-y-6 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Garanta a segurança do seu melhor amigo hoje mesmo.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Tenha tranquilidade sabendo que qualquer pessoa pode te contatar em segundos se houver um imprevisto.
            </p>
            <div>
              <Link 
                href="/register" 
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                Cadastrar Meu Pet Agora 🐾
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 DarkStar Dog Tags Inteligentes. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-slate-400 transition">Entrar</Link>
          <Link href="/register" className="hover:text-slate-400 transition">Criar Conta</Link>
        </div>
      </footer>

      <div className="flex justify-end mt-1 mb-4">
  <Link href="/recuperar-senha" className="text-xs text-indigo-400 hover:underline">
    Esqueceu sua senha?
  </Link>
</div>

    </div>
  )
}