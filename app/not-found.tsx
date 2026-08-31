import Link from 'next/link'

export default function NoEncontrada() {
  return (
    <main className="contenedor flex min-h-screen max-w-lg flex-col justify-center py-20 text-center">
      <p className="t-etiqueta mb-4">Error 404</p>
      <h1 className="t-grande mb-4">Esta página ya no existe</h1>
      <p className="t-cuerpo">
        Puede que el curso que buscabas haya terminado o que la dirección esté mal escrita.
      </p>
      <p className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/#cursos" className="boton boton-principal">
          Ver los cursos
        </Link>
        <Link href="/" className="boton boton-suave">
          Ir a la portada
        </Link>
      </p>
    </main>
  )
}
