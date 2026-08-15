import { redirect } from 'next/navigation'

export default function Home() {
  // Redireciona quem acessar a raiz direto para o dashboard ou login
  redirect('/login')
}