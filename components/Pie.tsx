import Link from 'next/link'
import { ESTUDIO, real } from '@/data/estudio'
import { prefijo, textos, type Idioma } from '@/lib/idioma'
import SelectorIdioma from './SelectorIdioma'
import Logo from '@/components/Logo'

export default function Pie({
  enlaces,
  idioma,
  equivalente,
}: {
  enlaces: { href: string; texto: string }[]
  idioma: Idioma
  equivalente?: Partial<Record<Idioma, string>>
}) {
  const t = textos(idioma)
  const p = prefijo(idioma)
  const { contacto, direccion, redes } = ESTUDIO
  const nombre = real(ESTUDIO.nombre) ?? 'El estudio'
  const anio = new Date().getFullYear()

  const calle = real(direccion.calle)
  const localidad = real(direccion.localidad)
  const cp = real(direccion.codigoPostal)
  const sociales = [
    real(redes.instagram) && { href: redes.instagram, texto: 'Instagram' },
    real(redes.facebook) && { href: redes.facebook, texto: 'Facebook' },
    real(redes.youtube) && { href: redes.youtube, texto: 'YouTube' },
  ].filter(Boolean) as { href: string; texto: string }[]

  return (
    <footer className="en-tinta overflow-hidden pt-20 md:pt-28">
      <div className="contenedor">
        {/* El logotipo a tamaño de cartel: cierra la página con la misma voz
            con la que empieza. En crema, porque el pie va en tinta. */}
        <p className="mb-16 md:mb-24">
          {/* Centrado: pegado al borde izquierdo de un contenedor de 84 rem, el
              logotipo quedaba tirado hacia un lado con medio pie vacío. */}
          <Logo className="mx-auto block w-[min(100%,46rem)]" />
          <span className="sr-only">{nombre}</span>
        </p>

        <div className="grid gap-y-12 border-t border-white/12 pt-12 md:grid-cols-3 md:gap-x-10">
          <nav className="flex flex-col items-start gap-1 text-[0.9375rem]">
            <p className="t-etiqueta mb-2">{t.laWeb}</p>
            {enlaces.map((e) => (
              <Link key={e.href} href={e.href} className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100">
                {e.texto}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-start gap-1 text-[0.9375rem]">
            <p className="t-etiqueta mb-2">{t.contacto}</p>
            {real(contacto.telefono) && (
              <a
                href={`tel:${real(contacto.telefonoE164) ?? ''}`}
                className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100"
              >
                {contacto.telefono}
              </a>
            )}
            {real(contacto.email) && (
              <a href={`mailto:${contacto.email}`} className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100">
                {contacto.email}
              </a>
            )}
            {(calle || localidad) && (
              <address className="not-italic leading-relaxed opacity-75">
                {calle}
                {calle && <br />}
                {[cp, localidad].filter(Boolean).join(' ')}
              </address>
            )}
            {real(ESTUDIO.horario) && <p className="opacity-55">{ESTUDIO.horario}</p>}
          </div>

          <div className="flex flex-col items-start gap-1 text-[0.9375rem]">
            <p className="t-etiqueta mb-2">{t.legal}</p>
            <Link
              href={`${p}/aviso-legal`}
              className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100"
            >
              {t.avisoLegal}
            </Link>
            <Link
              href={`${p}/privacidad`}
              className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100"
            >
              {t.privacidad}
            </Link>
            {sociales.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-5">
                {sociales.map((s) => (
                  <a
                    key={s.texto}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="enlace-linea flex min-h-11 items-center opacity-75 hover:opacity-100"
                  >
                    {s.texto}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
          className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-4"
        >
          <p className="text-[0.8125rem] opacity-45">
            © {anio} {real(ESTUDIO.legal.razonSocial) ?? nombre}
          </p>
          <SelectorIdioma idioma={idioma} equivalente={equivalente} />
        </div>
      </div>
    </footer>
  )
}
