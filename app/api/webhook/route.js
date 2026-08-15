import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use SERVICE_ROLE_KEY para ter permissão total de escrita
)

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.type === 'payment' || body.action === 'payment.created' || body.data) {
      const paymentId = body.data?.id || body.id

      if (paymentId) {
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
        })

        const paymentData = await mpResponse.json()

        if (paymentData.status === 'approved') {
          const petId = paymentData.external_reference

          if (petId) {
            // 1. Atualiza o pet no Supabase
            const { data: pet, error } = await supabase
              .from('pets')
              .update({ is_active: true })
              .eq('id', petId)
              .select('*')
              .single()

            if (error) {
              console.error('Erro ao atualizar pet:', error)
              return NextResponse.json({ error: 'Erro ao atualizar banco' }, { status: 500 })
            }

            // 2. DISPARO DOS E-MAILS (Adicionado aqui!)
            try {
              const linkPublicoPet = `https://pet-dog-tag-pzem.vercel.app/pet/${pet.id}`
              const urlQrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(linkPublicoPet)}`

              // E-mail para o cliente
              await resend.emails.send({
                from: 'DarkStar Dog Tag <onboarding@resend.dev>',
                to: pet.owner_email,
                subject: `🐾 Pagamento Aprovado! A tag do ${pet.name} está ativa!`,
                html: `
                  <div style="font-family: Arial; padding: 20px;">
                    <h2>Pagamento Aprovado! 🎉</h2>
                    <p>Olá <b>${pet.owner_name}</b>, sua Dog Tag para <b>${pet.name}</b> já está ativa.</p>
                    <div style="text-align: center; margin: 20px 0;">
                      <img src="${urlQrCodeImg}" width="200" />
                    </div>
                    <a href="${linkPublicoPet}">Acessar página do Pet</a>
                  </div>
                `
              })

              // E-mail para você (Dono)
              await resend.emails.send({
                from: 'DarkStar Dog Tag <onboarding@resend.dev>',
                to: 'fkffrannk03@gmail.com',
                subject: `💰 Nova Venda: ${pet.name}`,
                html: `<p>Nova plaqueta vendida: ${pet.name}. ID: ${pet.id}.</p>`
              })
            } catch (emailError) {
              console.error("Erro ao enviar e-mails:", emailError)
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}