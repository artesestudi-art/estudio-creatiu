/**
 * Datos estructurados.
 *
 * Se pinta como `<script>` normal con `dangerouslySetInnerHTML`, NO con el
 * `<Script>` de Next: ese componente inyecta la etiqueta desde JavaScript
 * después de cargar, así que el HTML que sirve el servidor —el que lee el
 * rastreador de Google— sale sin schema. Ya pasó en otra web del grupo: 97
 * páginas «con schema» que en realidad no lo servían.
 */
export default function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos) }}
    />
  )
}
