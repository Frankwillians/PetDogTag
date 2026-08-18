import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
})

export async function POST(request) {
  try {
    const { petId, email } = await request.json()

    const preference = new Preference(client)
    const response = await preference.create({
      body: {
        items: [{
          title: 'Ativação de Dog Tag',
          quantity: 1,
          unit_price: 10.00,
          currency_id: 'BRL'
        }],
        back_urls: {
          success: 'https://pet-dog-tag-pzem.vercel.app/dashboard',
          failure: 'https://pet-dog-tag-pzem.vercel.app/dashboard',
          pending: 'https://pet-dog-tag-pzem.vercel.app/dashboard'
        },
        auto_return: 'approved',
        external_reference: petId // Isso é crucial para identificar o pet no Webhook depois
      }
    })

    return NextResponse.json({ url: response.init_point })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}