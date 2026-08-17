'use client'

import Link from 'next/link'

export default function RecuperarSenhaPage() {
  // Substitua pelo seu número de WhatsApp real
  const numeroWhatsApp = "5583986670602" 
  const mensagemWhatsApp = "Olá! Preciso de ajuda para recuperar a senha da minha conta na DarkStar Pets. Meu e-mail é:"

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Suporte de Acesso</h1>
        <p className="text-sm text-slate-400 mb-8">
          Para garantir a máxima segurança dos dados do seu pet, a redefinição de senha é feita manualmente pela nossa equipe.
        </p>

        <div className="bg-slate-950 border border-indigo-900/50 p-6 rounded-xl mb-6">
          <p className="text-slate-300 text-sm mb-4">
            Toque no botão abaixo para entrar em contato conosco pelo WhatsApp e solicitar a sua nova senha.
          </p>
          
          <a 
            href={`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagemWhatsApp)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            Falar com o Suporte
          </a>
        </div>

        <p className="text-xs text-slate-500 mb-6">
          Em breve, você receberá uma senha temporária em seu e-mail após nosso atendimento.
        </p>

        <Link href="/login" className="text-indigo-400 hover:underline text-sm font-semibold">
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}