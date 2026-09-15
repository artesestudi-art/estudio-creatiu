import { NextResponse } from 'next/server'
import { enviarResenasPendientes } from '@/lib/resenas'

/**
 * La llama Vercel cada mañana (ver `crons` en vercel.json).
 *
 * Con `CRON_SECRET` puesto en Vercel, la propia Vercel manda la cabecera
 * `Authorization: Bearer <secreto>` y aquí se exige. Sin él la ruta queda
 * abierta, y es asumible: solo envía lo que ya tocaba enviar ese día y marca
 * cada envío, así que llamarla dos veces no duplica ningún correo.
 */

export const dynamic = 'force-dynamic'

export async function GET(peticion: Request) {
  const secreto = process.env.CRON_SECRET
  if (secreto && peticion.headers.get('authorization') !== `Bearer ${secreto}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const informe = await enviarResenasPendientes()
  console.log('[cron resenas]', informe)
  return NextResponse.json({ ok: true, ...informe })
}
