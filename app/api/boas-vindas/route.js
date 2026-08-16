import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { email, nome } = await request.json()

    await resend.emails.send({
      from: 'DarkStar Dog Tag <onboarding@resend.dev>',
      to: email,
      subject: '🐾 Bem-vindo à DarkStar Dog Tags!',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Olá, ${nome}! 🎉</h2>
          <p>Sua conta na <b>DarkStar Dog Tags Inteligentes</b> foi criada com sucesso.</p>
          <p>Agora você já pode acessar o painel, cadastrar seus pets e gerar as plaquetas com QR Code de segurança.</p>
          <div style="margin: 30px 0;">
            <a href="https://pet-dog-tag-pzem.vercel.app/login" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar Painel Agora</a>
          </div>
          <p style="color: #666; font-size: 12px;">Se tiver alguma dúvida, é só responder a este e-mail.</p>
        </div>
      `
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}