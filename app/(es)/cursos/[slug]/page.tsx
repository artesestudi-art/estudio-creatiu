import type { Metadata } from 'next'
import PaginaCurso, { buscarCurso } from '@/components/PaginaCurso'
import { cursosPublicados } from '@/lib/bd'
import { cursoEn, slugEn, tieneCatalan } from '@/lib/traduccion'
import { alternosDe } from '@/lib/seo'

/** Curso en castellano. */

export const revalidate = 300

export async function generateStaticParams() {
  // Si la base no responde durante el build, no se pre-genera nada: las
  // páginas se sirven bajo demanda en vez de tumbar el despliegue entero.
  try {
    const cursos = await cursosPublicados()
    return cursos.map((c) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const base = await buscarCurso(slug, 'es')
  if (!base) return { title: 'Curso no encontrado' }

  const curso = cursoEn(base, 'es')
  const titulo = curso.seo_titulo || curso.titulo
  const descripcion = curso.seo_descripcion || curso.resumen || undefined

  return {
    title: titulo,
    description: descripcion,
    // El alterno catalán solo se declara si existe de verdad: apuntar a una
    // página que repite el castellano es decirle a Google que hay duplicado.
    alternates: alternosDe('es', {
      es: `/cursos/${base.slug}`,
      ...(tieneCatalan(base) ? { ca: `/ca/cursos/${slugEn(base, 'ca')}` } : {}),
    }),
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `/cursos/${base.slug}`,
      locale: 'es_ES',
      images: curso.imagen ? [{ url: curso.imagen }] : undefined,
    },
  }
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PaginaCurso slug={slug} idioma="es" />
}
