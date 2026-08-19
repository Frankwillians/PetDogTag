'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fcfbfa] text-slate-800 flex flex-col justify-between selection:bg-amber-500 selection:text-white">
      
      {/* HEADER / TOPO - Ocupa 100% da largura */}
      <header className="w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-orange-100 backdrop-blur-md sticky top-0 z-50 bg-[#fcfbfa]/95 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="font-extrabold text-xl text-slate-900 tracking-wide">DarkStar Pets</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
            Entrar
          </Link>
          <Link href="/register" className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/20 transition">
            Criar Conta
          </Link>
        </div>
      </header>

      {/* HERO SECTION (DESTAQUE PRINCIPAL) - Largura fluida */}
      <main className="w-full px-6 sm:px-12 py-16 text-center space-y-12">
        
        <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-inner">
          ❤️ Porque todo membro da família merece voltar para casa em segurança.
        </div>

        <h1 className="text-4xl sm:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-5xl mx-auto">
          O pior pesadelo de todo tutor é ver o seu melhor amigo <span className="text-amber-600 underline decoration-amber-400/40">perdido na rua.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
          Um portão aberto, um susto com fogos de artifício, um descuido de segundos... O medo de não saber onde ele está aperta o coração de qualquer um. Com a DarkStar Pets, se alguém encontrar o seu companheiro, basta escanear a coleira para que a <strong>localização exata do GPS chegue direto no seu WhatsApp</strong>.
        </p>

        {/* ========================================== */}
        {/* COMO FUNCIONA (OCUPANDO ESPAÇO FLUIDO) */}
        {/* ========================================== */}
        <div className="pt-8 pb-6 border-y border-orange-200/60 my-6 max-w-6xl mx-auto">
          <div className="text-center space-y-2 mb-10">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full border border-amber-200">Passo a Passo</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900">Como cuidar de quem você ama em 3 passos</h2>
            <p className="text-sm text-slate-600 font-medium">Entenda como é simples proteger seu pet e garantir que ele volte para casa.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            
            <div className="bg-white border border-orange-200/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-400 shadow-md transition">
              <div className="text-3xl font-black text-amber-600/30 absolute top-4 right-4">01</div>
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-slate-900 text-lg">Cadastre com carinho</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Insira o nome, a foto e os dados de contato. O primeiro pet da família tem ativação 100% gratuita. Para os demais, cobramos apenas uma taxa única de R$ 10,00.</p>
            </div>

            <div className="bg-white border border-orange-200/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-400 shadow-md transition">
              <div className="text-3xl font-black text-amber-600/30 absolute top-4 right-4">02</div>
              <div className="text-2xl">🖨️</div>
              <h3 className="font-bold text-slate-900 text-lg">Monte a plaqueta</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Baixe o molde em PDF na hora, imprima em casa e coloque na coleira. Uma ponte direta entre o seu pet e o seu abraço.</p>
            </div>

            <div className="bg-white border border-orange-200/80 p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-400 shadow-md transition">
              <div className="text-3xl font-black text-amber-600/30 absolute top-4 right-4">03</div>
              <div className="text-2xl">📍</div>
              <h3 className="font-bold text-slate-900 text-lg">Resgate imediato</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">Se ele se perder, qualquer pessoa de bom coração que o encontrar poderá ler o QR Code e avisar onde ele está num piscar de olhos.</p>
            </div>

          </div>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS / CONFIANÇA */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto text-center">
          <div className="bg-white border border-emerald-200 p-4 rounded-xl shadow-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">R$ 0,00</p>
            <p className="text-xs text-slate-600 font-semibold">Ativação gratuita para o 1º pet</p>
          </div>
          <div className="bg-white border border-orange-200 p-4 rounded-xl shadow-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">R$ 10,00</p>
            <p className="text-xs text-slate-600 font-semibold">Taxa única para pets adicionais</p>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white border border-orange-200 p-4 rounded-xl shadow-md">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">Paz Mental</p>
            <p className="text-xs text-slate-600 font-semibold">Contato direto com quem achou</p>
          </div>
        </div>

        {/* SEÇÃO DE CHAMADA FINAL (CTA) COM OS BOTÕES DENTRO */}
        <div className="pt-10 pb-8 max-w-5xl mx-auto w-full">
          <div className="bg-amber-600 border border-amber-500 p-8 sm:p-12 rounded-3xl space-y-6 shadow-2xl text-white">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Não espere o susto acontecer para se prevenir.
            </h2>
            <p className="text-amber-50 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Dê ao seu fiel companheiro a segurança de voltar para casa caso ele se aventure longe demais.
            </p>
            
            {/* BOTÕES DE AÇÃO DENTRO DA DIV */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link 
                href="/register" 
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5"
              >
                Proteger Meu Pet Gratuitamente 🚀
              </Link>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base px-8 py-4 rounded-2xl transition border border-amber-500/40"
              >
                Acessar Minha Conta
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* RODAPÉ */}
      <footer className="w-full px-6 sm:px-12 py-8 border-t border-orange-100 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 DarkStar Pets. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-slate-800 transition font-medium">Entrar</Link>
          <Link href="/register" className="hover:text-slate-800 transition font-medium">Criar Conta</Link>
        </div>
      </footer>

    </div>
  )
}