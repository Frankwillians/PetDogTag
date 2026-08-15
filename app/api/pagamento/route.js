import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { petId } = await request.json()

    // Requisição direta via Fetch usando o e-mail de teste oficial do seu painel
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${petId}-${Date.now()}`
      },
      body: JSON.stringify({
        transaction_amount: 10.00,
        description: `Ativacao de Dog Tag - Pet ID: ${petId}`,
        payment_method_id: 'pix',
        payer: {
          // Usando o e-mail de teste exato que aparece no seu painel da print
          email: 'TESTUSER380982958258112438@testuser.com',
        }
      })
    })

    const data = await mpResponse.json()

    if (!mpResponse.ok) {
      console.error("Erro retornado pelo Mercado Pago:", data)
      return NextResponse.json({ error: data.message || JSON.stringify(data) }, { status: 400 })
    }

    return NextResponse.json({
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
      payment_id: data.id
    })
  } catch (error) {
    console.error("Erro interno no pagamento:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}