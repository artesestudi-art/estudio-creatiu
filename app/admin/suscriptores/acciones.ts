'use server'

import { revalidatePath } from 'next/cache'
import { borrarSuscriptor } from '@/lib/bd'
import { exigirSesion } from '../acciones'

export async function accionBorrar(datos: FormData) {
  await exigirSesion()
  await borrarSuscriptor(Number(datos.get('id')))
  revalidatePath('/admin/suscriptores')
  revalidatePath('/admin')
}
