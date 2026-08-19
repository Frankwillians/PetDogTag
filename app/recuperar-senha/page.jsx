'use client'

import Link from 'next/link'

export default function RecuperarSenhaPage() {
  // Substitua pelo seu número de WhatsApp real[cite: 10]
  const numeroWhatsApp = "5583986670602"
  const mensagemWhatsApp = "Olá! Preciso de ajuda para recuperar a senha da minha conta na DarkStar Pets. Meu e-mail é:"

  return (
    <div className="min-h-screen bg-[#e2e8f0] text-slate-900 flex items-center justify-center p-4 selection:bg-amber-500 selection:text-white">
      <div className="max-w-md w-full bg-[#f8fafc] border border-slate-300 p-8 rounded-3xl shadow-xl text-center">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Suporte de Acesso</h1>
        <p className="text-sm text-slate-600 mb-8 font-semibold">
          Para garantir a máxima segurança dos dados do seu pet, a redefinição de senha é feita manualmente pela nossa equipe.
        </p>

        <div className="bg-white border border-slate-300 p-6 rounded-2xl mb-6 shadow-sm">
          <p className="text-slate-700 text-sm mb-4 font-semibold">
            Toque no botão abaixo para entrar em contato conosco pelo WhatsApp e solicitar a sua nova senha.
          </p>
          
          <a 
            href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            Falar com o Suporte
          </a>
        </div>

        <p className="text-xs text-slate-500 mb-6 font-medium">
          Em breve, você receberá uma senha temporária em seu e-mail após nosso atendimento.
        </p>

        <Link href="/login" className="text-amber-700 hover:underline text-sm font-bold">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}