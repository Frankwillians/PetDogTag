'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* HEADER / TOPO */}
      <header className="max-w-6xl w-full mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/50 backdrop-blur-md sticky top-0 z-50 bg-slate-950/85">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-extrabold text-xl text-white tracking-wide">DarkStar Pets</span>
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
      <main className="max-w-5xl w-full mx-auto px-6 py-16 text-center space-y-12">
        
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner">
          ❤️ Porque todo membro da família merece voltar para casa em segurança.
        </div>

        <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.1]">
          O pior pesadelo de todo tutor é ver o seu melhor amigo <span className="text-indigo-500 underline decoration-indigo-500/30">perdido na rua.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Um portão aberto, um susto com fogos de artifício, um descuido de segundos... O medo de não saber onde ele está aperta o coração de qualquer um. Com a DarkStar Pets, se alguém encontrar o seu companheiro, basta escanear a coleira para que a <strong>localização exata do GPS chegue direto no seu WhatsApp</strong>.
        </p>

        {/* ========================================== */}
        {/* COMO FUNCIONA (LOGO APÓS A CHAMADA PRINCIPAL) */}
        {/* ========================================== */}
        <div className="pt-8 pb-6 border-y border-slate-900 my-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white">Como cuidar de quem você ama em 3 passos</h2>
            <p className="text-sm text-slate-400">Entenda como é simples proteger seu pet e garantir que ele volte para casa.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">

            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-800/40">Passo a Passo</span>

            
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">01</div>
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-white text-lg">Cadastre com carinho</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Insira o nome, a foto e os dados de contato. O primeiro pet da família tem ativação 100% gratuita[cite: 5]. Para os demais, cobramos apenas uma taxa única de R$ 10,00[cite: 5].</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">02</div>
              <div className="text-2xl">🖨️</div>
              <h3 className="font-bold text-white text-lg">Monte a plaqueta</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Baixe o molde em PDF na hora, imprima em casa e coloque na coleira[cite: 5]. Uma ponte direta entre o seu pet e o seu abraço[cite: 5].</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition">
              <div className="text-3xl font-black text-indigo-500/20 absolute top-4 right-4">03</div>
              <div className="text-2xl">📍</div>
              <h3 className="font-bold text-white text-lg">Resgate imediato</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Se ele se perder, qualquer pessoa de bom coração que o encontrar poderá ler o QR Code e avisar onde ele está num piscar de olhos[cite: 5].</p>
            </div>

          </div>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS / CONFIANÇA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-center">
          <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">R$ 0,00</p>
            <p className="text-xs text-slate-400">Ativação gratuita para o 1º pet[cite: 5]</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-white">R$ 10,00</p>
            <p className="text-xs text-slate-400">Taxa única para pets adicionais[cite: 5]</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-900/50 border border-slate-900 p-4 rounded-xl">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400">Paz Mental</p>
            <p className="text-xs text-slate-400">Contato direto com quem achou[cite: 5]</p>
          </div>
        </div>

        {/* SEÇÃO DE CHAMADA FINAL (CTA) COM OS BOTÕES DENTRO */}
        <div className="pt-10 pb-8">
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-800/50 p-8 sm:p-12 rounded-3xl space-y-6 shadow-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Não espere o susto acontecer para se prevenir.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              Dê ao seu fiel companheiro a segurança de voltar para casa caso ele se aventure longe demais.
            </p>
            
            {/* BOTÕES DE AÇÃO DENTRO DA DIV */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
              >
                Proteger Meu Pet Gratuitamente 🚀
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-base px-8 py-4 rounded-2xl transition"
              >
                Acessar Minha Conta
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="max-w-6xl w-full mx-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 DarkStar Pets. Todos os direitos reservados[cite: 5].</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-slate-400 transition">Entrar</Link>
          <Link href="/register" className="hover:text-slate-400 transition">Criar Conta</Link>
        </div>
      </footer>

    </div>
  )
}