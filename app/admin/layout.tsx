import type { Metadata } from 'next'
import Link from 'next/link'
import { haySesion } from '@/lib/sesion'
import { ESTUDIO } from '@/data/estudio'
import Login from './Login'
import { salir } from './acciones'

export const metadata: Metadata = {
  title: 'Panel',
  // El panel no se indexa jamás: una URL de gestión en Google es una invitación.
  robots: { index: false, follow: false },
}

const SECCIONES = [
  { href: '/admin', texto: 'Resumen' },
  { href: '/admin/inscripciones', texto: 'Inscripciones' },
  { href: '/admin/contactos', texto: 'Mensajes' },
  { href: '/admin/cursos', texto: 'Cursos' },
  { href: '/admin/portada', texto: 'Contenidos' },
  { href: '/admin/suscriptores', texto: 'Newsletter' },
]

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  // «de» + «el» se contrae en «del». Sin esto el panel saluda con «Panel de el
  // estudio». Es el mismo tropiezo que el topónimo con artículo en catalán.
  const nombre = ESTUDIO.nombre === 'PENDIENTE' ? null : ESTUDIO.nombre
  const titulo = nombre ? `Panel de ${nombre}` : 'Panel del estudio'

  if (!(await haySesion())) {
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900">
        <Login titulo={titulo} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
          <span className="text-[15px] font-semibold tracking-tight">
            {nombre ?? 'El estudio'}
          </span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            {SECCIONES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="text-neutral-600 transition hover:text-neutral-900"
              >
                {s.texto}
              </Link>
            ))}
          </nav>
          <form action={salir} className="ml-auto">
            <button type="submit" className="text-[14px] text-neutral-500 hover:text-neutral-900">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}
