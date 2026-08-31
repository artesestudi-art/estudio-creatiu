'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { MODALIDADES, type Curso } from '@/lib/bd'
import { aSlug } from '@/lib/texto'
import type { TraduccionCurso } from '@/lib/traduccion'
import { Campo, Tarjeta, claseBoton, claseInput } from '../../ui'
import { guardarCurso, type EstadoCurso } from '../acciones'

function Guardar({ nuevo }: { nuevo: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={claseBoton}>
      {pending ? 'Guardando…' : nuevo ? 'Crear curso' : 'Guardar cambios'}
    </button>
  )
}

export default function Editor({ curso, hayAlmacen }: { curso: Curso | null; hayAlmacen: boolean }) {
  const [estado, accion] = useActionState<EstadoCurso | null, FormData>(guardarCurso, null)
  const [titulo, setTitulo] = useState(curso?.titulo ?? '')
  const [slug, setSlug] = useState(curso?.slug ?? '')
  const [imagen, setImagen] = useState(curso?.imagen ?? '')
  const ca = (curso?.ca ?? {}) as TraduccionCurso
  const [caSlug, setCaSlug] = useState(ca.slug ?? '')
  const [caTitulo, setCaTitulo] = useState(ca.titulo ?? '')

  const slugFinal = aSlug(slug || titulo)
  const nuevo = !curso

  /**
   * Valor que toca pintar en cada campo.
   *
   * Si la acción devolvió error, React ya ha vaciado el formulario: manda lo
   * que el cliente tenía escrito. Si no, manda lo guardado en la base.
   */
  const previo = estado?.valores
  const val = (nombre: string, guardado: string | number | null | undefined) =>
    previo ? (previo[nombre] ?? '') : guardado != null ? String(guardado) : ''
  const marcado = (nombre: string, guardado: boolean) =>
    previo ? previo[nombre] === 'on' : guardado

  return (
    <form action={accion} className="space-y-5">
      {curso && <input type="hidden" name="id" value={curso.id} />}
      <input type="hidden" name="imagen_url" value={imagen} />

      {estado?.mensaje && !estado.ok && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700"
        >
          {estado.mensaje}
        </p>
      )}

      <Tarjeta className="space-y-4">
        <h2 className="text-[15px] font-semibold">Lo que ve el alumno</h2>

        <Campo etiqueta="Título del curso">
          <input
            name="titulo"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Cerámica: torno básico"
            className={claseInput}
          />
        </Campo>

        <Campo
          etiqueta="Dirección de la página"
          ayuda={
            curso?.publicado && slugFinal !== curso.slug
              ? '⚠️ Este curso ya está publicado. Cambiar la dirección rompe el enlace que Google tiene indexado y pierdes lo posicionado.'
              : `Quedará en /cursos/${slugFinal || '…'}`
          }
        >
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={aSlug(titulo)}
            className={claseInput}
          />
        </Campo>

        <Campo
          etiqueta="Resumen"
          ayuda="Dos líneas. Es lo que se lee en la tarjeta de la portada y en Google."
        >
          <textarea
            name="resumen"
            rows={2}
            defaultValue={val('resumen', curso?.resumen)}
            className={claseInput}
          />
        </Campo>

        <Campo etiqueta="Descripción completa" ayuda="Un párrafo por línea en blanco.">
          <textarea
            name="descripcion"
            rows={8}
            defaultValue={val('descripcion', curso?.descripcion)}
            className={claseInput}
          />
        </Campo>

        <Campo etiqueta="Temario" ayuda="Un punto por línea.">
          <textarea
            name="temario"
            rows={6}
            defaultValue={val('temario', curso?.temario)}
            placeholder={'Centrado de la pieza\nLevantado de paredes\nEsmaltado y horno'}
            className={claseInput}
          />
        </Campo>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="text-[15px] font-semibold">Datos prácticos</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Disciplina" ayuda="Cerámica, ilustración, fotografía…">
            <input name="disciplina" defaultValue={val('disciplina', curso?.disciplina)} className={claseInput} />
          </Campo>

          <Campo etiqueta="Modalidad">
            <select
              name="modalidad"
              defaultValue={val('modalidad', curso?.modalidad ?? 'presencial')}
              className={claseInput}
            >
              {MODALIDADES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </Campo>

          <Campo etiqueta="Nivel" ayuda="Iniciación, intermedio, abierto a todos…">
            <input name="nivel" defaultValue={val('nivel', curso?.nivel)} className={claseInput} />
          </Campo>

          <Campo etiqueta="Profesor o profesora">
            <input name="profesor" defaultValue={val('profesor', curso?.profesor)} className={claseInput} />
          </Campo>

          <Campo etiqueta="Duración" ayuda="8 sesiones de 2 h, un trimestre…">
            <input name="duracion" defaultValue={val('duracion', curso?.duracion)} className={claseInput} />
          </Campo>

          <Campo etiqueta="Horario habitual" ayuda="Martes de 18 a 20 h">
            <input name="horario" defaultValue={val('horario', curso?.horario)} className={claseInput} />
          </Campo>

          <Campo etiqueta="Precio (€)" ayuda="Solo el número: 180 o 180,50.">
            <input
              name="precio"
              inputMode="decimal"
              defaultValue={val(
                'precio',
                curso?.precio_centimos != null
                  ? String(curso.precio_centimos / 100).replace('.', ',')
                  : '',
              )}
              className={claseInput}
            />
          </Campo>

          <Campo
            etiqueta="Precio escrito"
            ayuda="Si lo rellenas, manda sobre el número: «180 € / trimestre», «desde 60 €»."
          >
            <input
              name="precio_texto"
              defaultValue={val('precio_texto', curso?.precio_texto)}
              className={claseInput}
            />
          </Campo>

          <Campo etiqueta="Plazas del grupo" ayuda="Solo informativo; el aforo real va en cada convocatoria.">
            <input
              name="plazas"
              inputMode="numeric"
              defaultValue={val('plazas', curso?.plazas)}
              className={claseInput}
            />
          </Campo>

          <Campo etiqueta="Orden" ayuda="Número más bajo, más arriba en la web.">
            <input
              name="orden"
              inputMode="numeric"
              defaultValue={val('orden', curso?.orden ?? 0)}
              className={claseInput}
            />
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="text-[15px] font-semibold">Imagen</h2>

        {imagen ? (
          <div className="flex flex-wrap items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagen}
              alt=""
              className="h-24 w-36 rounded-lg border border-neutral-200 object-cover"
            />
            <button
              type="button"
              onClick={() => setImagen('')}
              className="text-[13.5px] text-neutral-500 hover:text-red-600"
            >
              Quitar la imagen
            </button>
          </div>
        ) : (
          <p className="text-[14px] text-neutral-500">Este curso no tiene imagen.</p>
        )}

        {hayAlmacen ? (
          <Campo etiqueta="Subir una imagen" ayuda="JPG, PNG, WebP o AVIF. Máximo 6 MB.">
            <input
              type="file"
              name="imagen_fichero"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="block w-full text-[14px] file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3.5 file:py-2 file:text-[13.5px] file:font-semibold file:text-white"
            />
          </Campo>
        ) : (
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-3 text-[13.5px] text-amber-900">
            No hay almacén de imágenes configurado (falta <code>BLOB_READ_WRITE_TOKEN</code>). Mientras
            tanto se puede pegar la dirección de una imagen que ya esté publicada.
            <input
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              placeholder="https://…"
              className={`${claseInput} mt-2`}
            />
          </div>
        )}

        <Campo
          etiqueta="Texto alternativo"
          ayuda="Qué se ve en la foto. Lo lee quien no puede verla, y Google."
        >
          <input name="imagen_alt" defaultValue={val('imagen_alt', curso?.imagen_alt)} className={claseInput} />
        </Campo>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <h2 className="text-[15px] font-semibold">Google</h2>
        <Campo
          etiqueta="Título en Google"
          ayuda="Si lo dejas vacío se usa el título del curso. Unos 60 caracteres."
        >
          <input name="seo_titulo" defaultValue={val('seo_titulo', curso?.seo_titulo)} className={claseInput} />
        </Campo>
        <Campo
          etiqueta="Descripción en Google"
          ayuda="Si la dejas vacía se usa el resumen. Unos 155 caracteres."
        >
          <textarea
            name="seo_descripcion"
            rows={2}
            defaultValue={val('seo_descripcion', curso?.seo_descripcion)}
            className={claseInput}
          />
        </Campo>
      </Tarjeta>

      <Tarjeta className="space-y-4">
        <div>
          <h2 className="text-[15px] font-semibold">Català</h2>
          <p className="mt-1.5 text-[13px] text-neutral-500">
            Lo que dejes en blanco se enseñará en castellano. El curso solo aparece en el sitemap
            catalán cuando tiene <strong>título y resumen</strong> propios: una página que repite el
            castellano compite contra sí misma en Google.
          </p>
        </div>

        <Campo etiqueta="Títol del curs">
          <input
            name="ca_titulo"
            value={caTitulo}
            onChange={(e) => setCaTitulo(e.target.value)}
            className={claseInput}
          />
        </Campo>

        <Campo
          etiqueta="Adreça de la pàgina"
          ayuda={`Quedarà en /ca/cursos/${aSlug(caSlug || caTitulo) || '…'}. Si la deixes buida, es treu del títol.`}
        >
          <input
            name="ca_slug"
            value={caSlug}
            onChange={(e) => setCaSlug(e.target.value)}
            placeholder={aSlug(caTitulo)}
            className={claseInput}
          />
        </Campo>

        <Campo etiqueta="Resum">
          <textarea name="ca_resumen" rows={2} defaultValue={ca.resumen ?? ''} className={claseInput} />
        </Campo>

        <Campo etiqueta="Descripció completa">
          <textarea
            name="ca_descripcion"
            rows={7}
            defaultValue={ca.descripcion ?? ''}
            className={claseInput}
          />
        </Campo>

        <Campo etiqueta="Temari" ayuda="Un punt per línia.">
          <textarea name="ca_temario" rows={5} defaultValue={ca.temario ?? ''} className={claseInput} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Disciplina">
            <input name="ca_disciplina" defaultValue={ca.disciplina ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Nivell">
            <input name="ca_nivel" defaultValue={ca.nivel ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Durada">
            <input name="ca_duracion" defaultValue={ca.duracion ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Horari">
            <input name="ca_horario" defaultValue={ca.horario ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Preu escrit" ayuda="Només si el preu s'escriu diferent en català.">
            <input name="ca_precio_texto" defaultValue={ca.precio_texto ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Imparteix">
            <input name="ca_profesor" defaultValue={ca.profesor ?? ''} className={claseInput} />
          </Campo>
        </div>

        <Campo etiqueta="Text alternatiu de la imatge">
          <input name="ca_imagen_alt" defaultValue={ca.imagen_alt ?? ''} className={claseInput} />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Títol a Google">
            <input name="ca_seo_titulo" defaultValue={ca.seo_titulo ?? ''} className={claseInput} />
          </Campo>
          <Campo etiqueta="Descripció a Google">
            <input
              name="ca_seo_descripcion"
              defaultValue={ca.seo_descripcion ?? ''}
              className={claseInput}
            />
          </Campo>
        </div>
      </Tarjeta>

      <Tarjeta className="space-y-3">
        <label className="flex items-center gap-2.5 text-[14.5px]">
          <input
            type="checkbox"
            name="publicado"
            defaultChecked={marcado('publicado', curso?.publicado ?? false)}
            className="h-4 w-4"
          />
          Publicado (visible en la web)
        </label>
        <label className="flex items-center gap-2.5 text-[14.5px]">
          <input
            type="checkbox"
            name="destacado"
            defaultChecked={marcado('destacado', curso?.destacado ?? false)}
            className="h-4 w-4"
          />
          Destacado en la portada
        </label>
      </Tarjeta>

      <Guardar nuevo={nuevo} />
    </form>
  )
}
