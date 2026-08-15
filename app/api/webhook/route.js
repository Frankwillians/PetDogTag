import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializa o cliente Supabase com chave de serviço ou anon para atualizar o banco
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()

    // O Mercado Pago envia notificações de vários tipos. O pagamento aprovado vem como 'payment'
    if (body.type === 'payment' || body.action === 'payment.created' || body.data) {
      const paymentId = body.data?.id || body.id

      if (paymentId) {
        // Consulta os detalhes do pagamento diretamente na API do Mercado Pago
        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
          }
        })

        const paymentData = await mpResponse.json()

        // Verifica se o pagamento foi aprovado com sucesso
        if (paymentData.status === 'approved') {
          // O external_reference que passamos na criação foi o ID do Pet!
          const petId = paymentData.external_reference

          if (petId) {
            // Atualiza o pet no Supabase para ativo
            const { error } = await supabase
              .from('pets')
              .update({ is_active: true })
              .eq('id', petId)

            if (error) {
              console.error('Erro ao atualizar pet no Supabase via webhook:', error)
              return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 })
            }

            console.log(`Pet ${petId} ativado com sucesso via webhook!`)
          }
        }
      }
    }

    // Retorna 200 OK para o Mercado Pago saber que recebemos a notificação
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Erro no processamento do webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}