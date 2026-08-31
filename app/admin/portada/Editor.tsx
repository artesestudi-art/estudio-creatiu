'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import type { Contenido } from '@/lib/contenido'
import { Campo, Tarjeta, claseBoton, claseBotonSuave, claseInput } from '../ui'
import { guardarContenidoPortada, type EstadoPortada } from './acciones'

/**
 * Editor de la portada.
 *
 * Todo el estado vive en un objeto y viaja como JSON en un campo oculto. Cada
 * sección avisa de que si se deja vacía NO se pinta: así el cliente entiende
 * por qué desaparece un bloque, en vez de ver un hueco raro en la web.
 */

function Guardar() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={claseBoton}>
      {pending ? 'Guardando…' : 'Guardar contenidos'}
    </button>
  )
}

export default function Editor({
  inicial,
  hayAlmacen,
  idioma,
}: {
  inicial: Contenido
  hayAlmacen: boolean
  idioma: string
}) {
  // `key` en la página fuerza a React a montar un editor nuevo al cambiar de
  // idioma; sin eso, este estado conservaría los textos del idioma anterior.
  const [c, setC] = useState<Contenido>(inicial)
  const [estado, accion] = useActionState<EstadoPortada | null, FormData>(
    guardarContenidoPortada,
    null,
  )

  function cambiar<S extends keyof Contenido>(seccion: S, valor: Partial<Contenido[S]>) {
    setC((previo) => ({ ...previo, [seccion]: { ...previo[seccion], ...valor } }))
  }

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="contenido" value={JSON.stringify(c)} />
      <input type="hidden" name="idioma" value={idioma} />

      {estado && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-[14px] ${
            estado.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {estado.mensaje}
        </p>
      )}

      {/* ───────── Portada ───────── */}
      <Bloque titulo="Lo primero que se ve">
        <Campo etiqueta="Antetítulo" ayuda="Una línea corta encima del titular. Opcional.">
          <input
            value={c.hero.antetitulo}
            onChange={(e) => cambiar('hero', { antetitulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo
          etiqueta="Titular"
          ayuda="Que diga el OFICIO, no solo el nombre del estudio: quien llega de Google tiene que entender en cinco palabras qué se enseña aquí."
        >
          <textarea
            rows={2}
            value={c.hero.titular}
            onChange={(e) => cambiar('hero', { titular: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={3}
            value={c.hero.entradilla}
            onChange={(e) => cambiar('hero', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Texto del botón" ayuda="Vacío = «Ver los cursos».">
          <input
            value={c.hero.cta}
            onChange={(e) => cambiar('hero', { cta: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <ImagenCampo
          etiqueta="Imagen de portada"
          url={c.hero.imagen}
          alt={c.hero.imagenAlt}
          hayAlmacen={hayAlmacen}
          onCambio={(imagen, imagenAlt) => cambiar('hero', { imagen, imagenAlt })}
        />
      </Bloque>

      {/* ───────── Sobre ───────── */}
      <Bloque titulo="El estudio">
        <Campo etiqueta="Título de la sección">
          <input
            value={c.sobre.titulo}
            onChange={(e) => cambiar('sobre', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Texto" ayuda="Un párrafo por línea en blanco.">
          <textarea
            rows={7}
            value={c.sobre.texto}
            onChange={(e) => cambiar('sobre', { texto: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <ImagenCampo
          etiqueta="Foto del taller"
          url={c.sobre.imagen}
          alt={c.sobre.imagenAlt}
          hayAlmacen={hayAlmacen}
          onCambio={(imagen, imagenAlt) => cambiar('sobre', { imagen, imagenAlt })}
        />
        <Lista
          titulo="Puntos destacados"
          ayuda="Tres o cuatro cosas que os diferencian. Sin cifras que no puedas demostrar."
          elementos={c.sobre.puntos}
          nuevo={() => ({ titulo: '', texto: '' })}
          onCambio={(puntos) => cambiar('sobre', { puntos })}
          campos={[
            { clave: 'titulo', etiqueta: 'Título' },
            { clave: 'texto', etiqueta: 'Texto', largo: true },
          ]}
        />
      </Bloque>

      {/* ───────── Cursos ───────── */}
      <Bloque titulo="Cabecera de la sección de cursos">
        <p className="text-[13.5px] text-neutral-500">
          Los cursos en sí se gestionan en <strong>Cursos</strong>. Aquí solo va el texto que los
          presenta.
        </p>
        <Campo etiqueta="Título">
          <input
            value={c.cursos.titulo}
            onChange={(e) => cambiar('cursos', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={2}
            value={c.cursos.entradilla}
            onChange={(e) => cambiar('cursos', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
      </Bloque>

      {/* ───────── Talleres a medida ───────── */}
      <Bloque titulo="Talleres a medida">
        <p className="text-[13.5px] text-neutral-500">
          Lo que no es un curso con matrícula: cumpleaños, talleres de empresa, despedidas,
          talleres de un día. Si no añades ninguno, la sección no aparece en la web.
        </p>
        <Campo etiqueta="Título">
          <input
            value={c.talleres.titulo}
            onChange={(e) => cambiar('talleres', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={2}
            value={c.talleres.entradilla}
            onChange={(e) => cambiar('talleres', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Talleres"
          ayuda="Uno por cada cosa que ofreces fuera de los cursos. El precio puede quedarse en blanco si va a presupuesto."
          elementos={c.talleres.lista}
          nuevo={() => ({ titulo: '', texto: '', precio: '' })}
          onCambio={(lista) => cambiar('talleres', { lista })}
          campos={[
            { clave: 'titulo', etiqueta: 'Qué es' },
            { clave: 'texto', etiqueta: 'De qué va', largo: true },
            { clave: 'precio', etiqueta: 'Precio (o «a consultar»)' },
          ]}
        />
      </Bloque>

      {/* ───────── Método ───────── */}
      <Bloque titulo="Cómo funciona">
        <Campo etiqueta="Título">
          <input
            value={c.metodo.titulo}
            onChange={(e) => cambiar('metodo', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={2}
            value={c.metodo.entradilla}
            onChange={(e) => cambiar('metodo', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Pasos"
          ayuda="Del «te inscribes» al «primera clase». Baja la ansiedad de quien duda."
          elementos={c.metodo.pasos}
          nuevo={() => ({ titulo: '', texto: '' })}
          onCambio={(pasos) => cambiar('metodo', { pasos })}
          campos={[
            { clave: 'titulo', etiqueta: 'Título' },
            { clave: 'texto', etiqueta: 'Texto', largo: true },
          ]}
        />
      </Bloque>

      {/* ───────── Profesorado ───────── */}
      <Bloque titulo="Profesorado">
        <Campo etiqueta="Título">
          <input
            value={c.profesorado.titulo}
            onChange={(e) => cambiar('profesorado', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={2}
            value={c.profesorado.entradilla}
            onChange={(e) => cambiar('profesorado', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Personas"
          ayuda="Solo gente que da clase de verdad, con su nombre real."
          elementos={c.profesorado.personas}
          nuevo={() => ({ nombre: '', rol: '', bio: '', foto: '' })}
          onCambio={(personas) => cambiar('profesorado', { personas })}
          campos={[
            { clave: 'nombre', etiqueta: 'Nombre' },
            { clave: 'rol', etiqueta: 'Qué imparte' },
            { clave: 'bio', etiqueta: 'Breve biografía', largo: true },
            { clave: 'foto', etiqueta: 'Foto (URL)', imagen: true },
          ]}
          hayAlmacen={hayAlmacen}
        />
      </Bloque>

      {/* ───────── Galería ───────── */}
      <Bloque titulo="Galería">
        <Campo etiqueta="Título">
          <input
            value={c.galeria.titulo}
            onChange={(e) => cambiar('galeria', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla">
          <textarea
            rows={2}
            value={c.galeria.entradilla}
            onChange={(e) => cambiar('galeria', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Imágenes"
          ayuda="Trabajos reales de los alumnos o del taller. Nada de bancos de imágenes: se nota, y varias webs acaban con la misma foto."
          elementos={c.galeria.imagenes}
          nuevo={() => ({ url: '', alt: '' })}
          onCambio={(imagenes) => cambiar('galeria', { imagenes })}
          campos={[
            { clave: 'url', etiqueta: 'Imagen', imagen: true },
            { clave: 'alt', etiqueta: 'Qué se ve en la foto' },
          ]}
          hayAlmacen={hayAlmacen}
        />
      </Bloque>

      {/* ───────── Testimonios ───────── */}
      <Bloque titulo="Opiniones de alumnos">
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-[13.5px] text-amber-900">
          <strong>Solo opiniones reales, con permiso de quien las firma.</strong> Un testimonio
          inventado con nombre y apellido es una reseña falsa: engaña a quien lo lee y expone al
          estudio. Si no hay ninguna todavía, deja la lista vacía y la sección no aparece.
        </p>
        <Campo etiqueta="Título">
          <input
            value={c.testimonios.titulo}
            onChange={(e) => cambiar('testimonios', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Opiniones"
          elementos={c.testimonios.opiniones}
          nuevo={() => ({ texto: '', autor: '', curso: '' })}
          onCambio={(opiniones) => cambiar('testimonios', { opiniones })}
          campos={[
            { clave: 'texto', etiqueta: 'Lo que dijo', largo: true },
            { clave: 'autor', etiqueta: 'Quién lo dijo' },
            { clave: 'curso', etiqueta: 'De qué curso' },
          ]}
        />
      </Bloque>

      {/* ───────── FAQ ───────── */}
      <Bloque titulo="Preguntas frecuentes">
        <Campo etiqueta="Título">
          <input
            value={c.faq.titulo}
            onChange={(e) => cambiar('faq', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Lista
          titulo="Preguntas"
          ayuda="Las que te hacen por teléfono: material incluido, si hay que saber dibujar, si se puede recuperar una clase."
          elementos={c.faq.preguntas}
          nuevo={() => ({ pregunta: '', respuesta: '' })}
          onCambio={(preguntas) => cambiar('faq', { preguntas })}
          campos={[
            { clave: 'pregunta', etiqueta: 'Pregunta' },
            { clave: 'respuesta', etiqueta: 'Respuesta', largo: true },
          ]}
        />
      </Bloque>

      {/* ───────── Contacto y newsletter ───────── */}
      <Bloque titulo="Contacto y newsletter">
        <Campo etiqueta="Título de contacto">
          <input
            value={c.contacto.titulo}
            onChange={(e) => cambiar('contacto', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla de contacto">
          <textarea
            rows={2}
            value={c.contacto.entradilla}
            onChange={(e) => cambiar('contacto', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Título de la newsletter">
          <input
            value={c.newsletter.titulo}
            onChange={(e) => cambiar('newsletter', { titulo: e.target.value })}
            className={claseInput}
          />
        </Campo>
        <Campo etiqueta="Entradilla de la newsletter" ayuda="Di qué se recibe y cada cuánto.">
          <textarea
            rows={2}
            value={c.newsletter.entradilla}
            onChange={(e) => cambiar('newsletter', { entradilla: e.target.value })}
            className={claseInput}
          />
        </Campo>
      </Bloque>

      <div className="sticky bottom-4 flex justify-end">
        <div className="rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
          <Guardar />
        </div>
      </div>
    </form>
  )
}

/* ───────────────────────── Piezas ───────────────────────── */

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Tarjeta className="space-y-4">
      <h2 className="text-[15px] font-semibold">{titulo}</h2>
      {children}
      <p className="text-[12.5px] text-neutral-400">
        Si dejas esta sección vacía, no se pinta en la web.
      </p>
    </Tarjeta>
  )
}

type CampoLista = { clave: string; etiqueta: string; largo?: boolean; imagen?: boolean }

function Lista<T extends Record<string, string>>({
  titulo,
  ayuda,
  elementos,
  nuevo,
  onCambio,
  campos,
  hayAlmacen = false,
}: {
  titulo: string
  ayuda?: string
  elementos: T[]
  nuevo: () => T
  onCambio: (valor: T[]) => void
  campos: CampoLista[]
  hayAlmacen?: boolean
}) {
  function editar(indice: number, clave: string, valor: string) {
    onCambio(elementos.map((e, i) => (i === indice ? { ...e, [clave]: valor } : e)))
  }
  function mover(indice: number, salto: number) {
    const destino = indice + salto
    if (destino < 0 || destino >= elementos.length) return
    const copia = [...elementos]
    ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
    onCambio(copia)
  }

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">{titulo}</p>
      {ayuda && <p className="mb-2.5 text-[12.5px] text-neutral-500">{ayuda}</p>}

      <div className="space-y-3">
        {elementos.map((elemento, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3.5">
            <div className="mb-2 flex items-center gap-2 text-[12.5px] text-neutral-500">
              <span>#{i + 1}</span>
              <button type="button" onClick={() => mover(i, -1)} className="hover:text-neutral-900">
                ↑
              </button>
              <button type="button" onClick={() => mover(i, 1)} className="hover:text-neutral-900">
                ↓
              </button>
              <button
                type="button"
                onClick={() => onCambio(elementos.filter((_, j) => j !== i))}
                className="ml-auto hover:text-red-600"
              >
                Quitar
              </button>
            </div>
            <div className="space-y-2.5">
              {campos.map((campo) =>
                campo.imagen ? (
                  <ImagenCampo
                    key={campo.clave}
                    etiqueta={campo.etiqueta}
                    url={elemento[campo.clave] ?? ''}
                    hayAlmacen={hayAlmacen}
                    onCambio={(url) => editar(i, campo.clave, url)}
                  />
                ) : (
                  <Campo key={campo.clave} etiqueta={campo.etiqueta}>
                    {campo.largo ? (
                      <textarea
                        rows={3}
                        value={elemento[campo.clave] ?? ''}
                        onChange={(e) => editar(i, campo.clave, e.target.value)}
                        className={claseInput}
                      />
                    ) : (
                      <input
                        value={elemento[campo.clave] ?? ''}
                        onChange={(e) => editar(i, campo.clave, e.target.value)}
                        className={claseInput}
                      />
                    )}
                  </Campo>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onCambio([...elementos, nuevo()])}
        className={`${claseBotonSuave} mt-3`}
      >
        Añadir
      </button>
    </div>
  )
}

function ImagenCampo({
  etiqueta,
  url,
  alt,
  hayAlmacen,
  onCambio,
}: {
  etiqueta: string
  url: string
  alt?: string
  hayAlmacen: boolean
  onCambio: (url: string, alt: string) => void
}) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  async function subir(fichero: File) {
    setSubiendo(true)
    setError('')
    const cuerpo = new FormData()
    cuerpo.append('fichero', fichero)
    try {
      const respuesta = await fetch('/api/admin/subir', { method: 'POST', body: cuerpo })
      const datos = (await respuesta.json()) as { ok: boolean; url?: string; motivo?: string }
      if (datos.ok && datos.url) onCambio(datos.url, alt ?? '')
      else setError(datos.motivo ?? 'No se pudo subir.')
    } catch {
      setError('No se pudo subir. Comprueba la conexión.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-neutral-700">{etiqueta}</p>
      <div className="flex flex-wrap items-start gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-20 w-28 rounded-lg border border-neutral-200 object-cover"
          />
        )}
        <div className="min-w-[220px] flex-1 space-y-2">
          {hayAlmacen ? (
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={subiendo}
              onChange={(e) => {
                const fichero = e.target.files?.[0]
                if (fichero) void subir(fichero)
              }}
              className="block w-full text-[13.5px] file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-[13px] file:font-semibold file:text-white"
            />
          ) : (
            <input
              value={url}
              onChange={(e) => onCambio(e.target.value, alt ?? '')}
              placeholder="https://…"
              className={claseInput}
            />
          )}
          {subiendo && <p className="text-[12.5px] text-neutral-500">Subiendo…</p>}
          {error && <p className="text-[12.5px] text-red-600">{error}</p>}
          {alt !== undefined && (
            <input
              value={alt}
              onChange={(e) => onCambio(url, e.target.value)}
              placeholder="Qué se ve en la foto"
              className={claseInput}
            />
          )}
          {url && (
            <button
              type="button"
              onClick={() => onCambio('', '')}
              className="text-[12.5px] text-neutral-500 hover:text-red-600"
            >
              Quitar la imagen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
