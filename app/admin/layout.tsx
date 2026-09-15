import type { Metadata } from 'next'
import Link from 'next/link'
import { ID_ARRANQUE, sinUsuarios, usuarioActual } from '@/lib/sesion'
import { ESTUDIO } from '@/data/estudio'
import Logo from '@/components/Logo'
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
  { href: '/admin/resenas', texto: 'Reseñas' },
  { href: '/admin/portada', texto: 'Contenidos' },
  { href: '/admin/suscriptores', texto: 'Newsletter' },
  { href: '/admin/equipo', texto: 'Equipo' },
]

export default async function LayoutPanel({ children }: { children: React.ReactNode }) {
  // «de» + «el» se contrae en «del». Sin esto el panel saluda con «Panel de el
  // estudio». Es el mismo tropiezo que el topónimo con artículo en catalán.
  const nombre = ESTUDIO.nombre === 'PENDIENTE' ? null : ESTUDIO.nombre
  const titulo = nombre ? `Panel de ${nombre}` : 'Panel del estudio'

  const usuario = await usuarioActual()
  if (!usuario) {
    return (
      <Login titulo={titulo} arranque={await sinUsuarios()} />
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-[var(--color-linea)] bg-[var(--color-marca-crema)] text-[var(--color-marca-marino)]">
        {/* Las cuatro manchas de la lámina, como en la puerta del panel. */}
        <div aria-hidden className="flex h-1">
          <span className="flex-1 bg-[var(--color-marca-mostaza)]" />
          <span className="flex-1 bg-[var(--color-marca-salmon)]" />
          <span className="flex-1 bg-[var(--color-marca-malva)]" />
          <span className="flex-1 bg-[var(--color-marca-azul)]" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo className="h-9 w-auto" />
            <span className="sr-only">{nombre ?? 'El estudio'}</span>
            <span className="border-l border-[var(--color-linea-fuerte)] pl-2.5 font-[family-name:var(--font-display)] text-[11px] uppercase tracking-[0.24em] text-[var(--color-tinta-60)]">
              Panel
            </span>
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            {SECCIONES.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="text-[var(--color-tinta-80)] transition hover:text-[var(--color-marca-marino)] hover:underline hover:underline-offset-4"
              >
                {s.texto}
              </Link>
            ))}
          </nav>
          <span className="ml-auto text-[13px] text-[var(--color-tinta-60)]">
            {usuario.nombre || usuario.email}
          </span>
          <form action={salir}>
            <button type="submit" className="text-[14px] text-[var(--color-tinta-60)] hover:text-[var(--color-marca-marino)]">
              Salir
            </button>
          </form>
        </div>
      </header>
      {/* Mientras se entre con la contraseña de instalación, el aviso no se
          quita: es la única puerta del panel que no tiene dueño ni nombre. */}
      {usuario.id === ID_ARRANQUE && (
        <div className="border-b border-amber-200 bg-amber-50">
          <p className="mx-auto max-w-6xl px-5 py-2.5 text-[13.5px] text-amber-900">
            Has entrado con la contraseña de instalación.{' '}
            <Link href="/admin/equipo" className="font-semibold underline">
              Crea tu usuario
            </Link>{' '}
            con tu correo: al hacerlo, esta puerta se cierra sola.
          </p>
        </div>
      )}
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}
