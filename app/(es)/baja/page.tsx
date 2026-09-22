import type { Metadata } from 'next'
import Link from 'next/link'
import { darDeBaja } from '@/lib/bd'

export const metadata: Metadata = {
  title: 'Baja de la newsletter',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Baja de la newsletter desde el enlace del correo.
 *
 * Se exige el token que va en ese enlace: sin él, cualquiera podría dar de
 * baja a otra persona con solo conocer su dirección. Y la fila NO se borra, se
 * marca: si se borrara, la siguiente importación de correos volvería a
 * apuntarla y volveríamos a escribirle sin permiso.
 */
export default async function Baja({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams
  const dada = t ? await darDeBaja(t) : false

  return (
    <main className="contenedor flex min-h-screen max-w-lg flex-col justify-center py-20 text-center">
      <h1 className="t-grande mb-4">{dada ? 'Listo, te has dado de baja' : 'No hemos podido darte de baja'}</h1>
      <p className="t-cuerpo">
        {dada
          ? 'No volverás a recibir nuestros correos. Si algún día cambias de idea, puedes apuntarte otra vez desde la web.'
          : 'Puede que ya estuvieras de baja o que el enlace haya caducado. Escríbenos y lo hacemos a mano.'}
      </p>
      <p className="mt-8">
        <Link href="/" className="boton boton-suave">
          Volver a la web
        </Link>
      </p>
    </main>
  )
}
