import type { Metadata } from 'next'
import PaginaCurso, { buscarCurso } from '@/components/PaginaCurso'
import { cursosPublicados } from '@/lib/bd'
import { cursoEn, slugEn, tieneCatalan } from '@/lib/traduccion'
import { alternosDe } from '@/lib/seo'

/** Curso en catalán. */

export const revalidate = 300

export async function generateStaticParams() {
  try {
    const cursos = await cursosPublicados()
    return cursos.map((c) => ({ slug: slugEn(c, 'ca') }))
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
  const base = await buscarCurso(slug, 'ca')
  if (!base) return { title: 'Curs no trobat' }

  const curso = cursoEn(base, 'ca')
  const titulo = curso.seo_titulo || curso.titulo
  const descripcion = curso.seo_descripcion || curso.resumen || undefined

  return {
    title: titulo,
    description: descripcion,
    alternates: alternosDe('ca', {
      es: `/cursos/${base.slug}`,
      ca: `/ca/cursos/${slugEn(base, 'ca')}`,
    }),
    // Sin traducción propia, esta página repite el castellano: que no la
    // indexe. Es preferible a competir contra uno mismo por la misma palabra.
    robots: tieneCatalan(base) ? undefined : { index: false, follow: true },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: `/ca/cursos/${slugEn(base, 'ca')}`,
      locale: 'ca_ES',
      images: curso.imagen ? [{ url: curso.imagen }] : undefined,
    },
  }
}

export default async function PaginaCatalan({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <PaginaCurso slug={slug} idioma="ca" />
}
