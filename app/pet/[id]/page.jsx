'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PetPage() {
  const params = useParams()
  const petId = params.id

  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scanStatus, setScanStatus] = useState('Buscando informações...')

  useEffect(() => {
    if (!petId) return

    async function fetchPetAndSendPing() {
      try {
        // 1. Buscar os dados do pet no Supabase
        const { data: petData, error: petError } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .single()

        if (petError || !petData) {
          console.log("Erro do Supabase:", petError)  
          setScanStatus('Pet não encontrado.')
          setLoading(false)
          return
        }

        setPet(petData)
        setLoading(false)

        // 2. Capturar Geolocalização e enviar o Ping automaticamente
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const latitude = position.coords.latitude
              const longitude = position.coords.longitude

              // Envia o registro de scan para o banco de dados
              await supabase.from('pet_scans').insert([
                { pet_id: petId, latitude, longitude }
              ])

              setScanStatus('Localização enviada ao dono com sucesso!')
            },
            (error) => {
              console.log('Erro de geolocalização:', error)
              setScanStatus('Não foi possível obter a localização (permissão negada).')
            },
            { enableHighAccuracy: true }
          )
        } else {
          setScanStatus('Geolocalização não suportada neste navegador.')
        }

      } catch (err) {
        console.error(err)
        setScanStatus('Ocorreu um erro ao carregar os dados.')
      }
    }

    fetchPetAndSendPing()
  }, [petId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
        <p className="text-lg font-medium animate-pulse">Carregando informações do pet...</p>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-red-50 text-red-600">
        <p className="text-xl font-bold">Ops! Este pet não foi encontrado ou a tag é inválida.</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-amber-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-amber-100 text-center">
        
        <div className="mb-4 inline-block rounded-full bg-red-100 p-3 text-red-600 font-bold text-xs uppercase tracking-wider">
          🚨 Pet Perdido / Encontrado
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-1">{pet.name}</h1>
        <p className="text-gray-500 mb-6">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>

        {pet.bio && (
          <div className="mb-6 rounded-lg bg-gray-50 p-4 text-left text-gray-700 text-sm">
            <p className="font-semibold text-gray-900 mb-1">Informações importantes:</p>
            <p>{pet.bio}</p>
          </div>
        )}

        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
          <p className="text-xs text-amber-800 font-medium mb-1">Status do Alerta:</p>
          <p className="text-sm font-bold text-amber-900">{scanStatus}</p>
        </div>

        <div className="space-y-3">
          <a
            href={`tel:${pet.contact_phone}`}
            className="block w-full rounded-xl bg-emerald-600 py-3 text-center font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            Ligar para o Dono ({pet.owner_name})
          </a>

          <a
            href={`https://wa.me/55${pet.contact_phone.replace(/\D/g, '')}?text=Olá! Encontrei o seu pet ${pet.name}!`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-xl bg-green-500 py-3 text-center font-bold text-white shadow-md hover:bg-green-600 transition"
          >
            Enviar WhatsApp
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Sistema de Dog Tags Inteligentes • DarkStar
        </p>
      </div>
    </main>
  )
}