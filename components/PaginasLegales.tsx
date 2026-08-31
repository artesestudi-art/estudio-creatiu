import Link from 'next/link'
import { ESTUDIO, real } from '@/data/estudio'
import { CODIGO, PRINCIPAL, prefijo, type Idioma } from '@/lib/idioma'
import SelectorIdioma from '@/components/SelectorIdioma'

/**
 * Aviso legal y privacidad, en los dos idiomas.
 *
 * El texto describe lo que esta web hace DE VERDAD: guarda el formulario en
 * Neon, avisa por Resend y no pone cookies de terceros. Copiar una plantilla
 * que hable de Google Analytics cuando no lo hay es tan incorrecto como no
 * tener política. Si algún día se añade analítica, hay que actualizar esto.
 */

function domicilio(): string | null {
  const partes = [
    real(ESTUDIO.direccion.calle),
    real(ESTUDIO.direccion.codigoPostal),
    real(ESTUDIO.direccion.localidad),
  ].filter(Boolean)
  return partes.length ? partes.join(', ') : null
}

/* ─────────────────────────── Aviso legal ─────────────────────────── */

export function AvisoLegal({ idioma }: { idioma: Idioma }) {
  const nombre = real(ESTUDIO.nombre) ?? 'El estudio'
  const p = prefijo(idioma)
  const ca = idioma === 'ca'

  const faltan = [
    real(ESTUDIO.legal.razonSocial),
    real(ESTUDIO.legal.nif),
    real(ESTUDIO.direccion.calle),
  ].some((v) => v === null)

  return (
    <main
      lang={idioma === PRINCIPAL ? undefined : CODIGO[idioma]}
      className="contenedor max-w-3xl py-24"
    >
      {/* Estas páginas no llevan cabecera, así que el cambio de idioma tiene
          que estar aquí: sin él, quien aterriza en `/ca/aviso-legal` —desde el
          pie de la web catalana o desde un enlace— se queda sin manera de
          volver al castellano. */}
      <div className="flex items-center justify-between gap-6">
        <Link href={p || '/'} className="enlace-linea -ml-1 inline-flex min-h-11 items-center px-1 text-[0.9rem] opacity-60">
          ← {ca ? 'Tornar' : 'Volver'}
        </Link>
        <SelectorIdioma idioma={idioma} />
      </div>
      <h1 className="t-media mb-10 mt-8 !text-[2.4rem]">{ca ? 'Avís legal' : 'Aviso legal'}</h1>

      {faltan && (
        <p className="mb-10 border-l-2 border-[var(--color-acento)] py-2 pl-4 text-[0.9rem]">
          <strong>{ca ? 'Sense acabar:' : 'Sin terminar:'}</strong>{' '}
          {ca
            ? "falten les dades del titular (nom, NIF i domicili). Un avís legal incomplet incompleix la LSSI."
            : 'faltan los datos del titular (razón social, NIF y domicilio). Un aviso legal incompleto incumple la LSSI.'}
        </p>
      )}

      <div className="space-y-10">
        <Bloque titulo={ca ? 'Titular del lloc web' : 'Titular del sitio'}>
          <Fila etiqueta={ca ? 'Denominació' : 'Denominación'} valor={real(ESTUDIO.legal.razonSocial)} idioma={idioma} />
          <Fila etiqueta="NIF" valor={real(ESTUDIO.legal.nif)} idioma={idioma} />
          <Fila etiqueta={ca ? 'Domicili' : 'Domicilio'} valor={domicilio()} idioma={idioma} />
          <Fila etiqueta={ca ? 'Correu' : 'Correo'} valor={real(ESTUDIO.contacto.email)} idioma={idioma} />
          <Fila etiqueta={ca ? 'Telèfon' : 'Teléfono'} valor={real(ESTUDIO.contacto.telefono)} idioma={idioma} />
          <Fila etiqueta={ca ? 'Lloc web' : 'Sitio web'} valor={real(ESTUDIO.url)} idioma={idioma} />
        </Bloque>

        <Bloque titulo={ca ? 'Objecte' : 'Objeto'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? `Aquest lloc informa sobre els cursos i les activitats de ${nombre} i permet demanar-hi plaça. Enviar el formulari és una sol·licitud, no una matrícula: la plaça queda confirmada quan ${nombre} ho comunica per escrit.`
              : `Este sitio informa sobre los cursos y actividades de ${nombre} y permite solicitar plaza en ellos. El envío del formulario es una solicitud, no una matrícula: la plaza queda confirmada cuando ${nombre} lo comunica por escrito.`}
          </p>
        </Bloque>

        <Bloque titulo={ca ? "Condicions d'ús" : 'Condiciones de uso'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? "L'accés a aquest lloc és gratuït. Qui l'utilitza es compromet a no fer-ne un ús il·lícit ni a introduir dades falses de terceres persones als formularis."
              : 'El acceso a este sitio es gratuito. Quien lo usa se compromete a no emplearlo para fines ilícitos ni a introducir datos falsos de terceros en los formularios.'}
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Propietat intel·lectual' : 'Propiedad intelectual'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? `Els textos, les fotografies i les obres que apareixen en aquest lloc pertanyen a ${nombre} o als seus autors, que n'han autoritzat la publicació. No es poden reproduir sense permís.`
              : `Los textos, fotografías y obras que aparecen en este sitio pertenecen a ${nombre} o a sus autores, que han autorizado su publicación. No pueden reproducirse sin permiso.`}
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Responsabilitat' : 'Responsabilidad'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? `${nombre} procura que la informació sobre cursos, preus i dates estigui al dia, però no respon d'errors tipogràfics. En cas de discrepància, preval el que es confirmi per escrit en formalitzar la inscripció.`
              : `${nombre} procura que la información sobre cursos, precios y fechas esté al día, pero no responde de errores tipográficos. En caso de discrepancia, prevalece lo que se confirme por escrito al formalizar la inscripción.`}
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Legislació aplicable' : 'Legislación aplicable'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? "Aquesta relació es regeix per la legislació espanyola. Per a qualsevol controvèrsia, les parts se sotmeten als jutjats del domicili del consumidor."
              : 'Esta relación se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados del domicilio del consumidor.'}
          </p>
        </Bloque>
      </div>
    </main>
  )
}

/* ─────────────────────────── Privacidad ─────────────────────────── */

export function Privacidad({ idioma }: { idioma: Idioma }) {
  const nombre = real(ESTUDIO.nombre) ?? 'El estudio'
  const correo = real(ESTUDIO.contacto.email)
  const p = prefijo(idioma)
  const ca = idioma === 'ca'

  return (
    <main
      lang={idioma === PRINCIPAL ? undefined : CODIGO[idioma]}
      className="contenedor max-w-3xl py-24"
    >
      {/* Estas páginas no llevan cabecera, así que el cambio de idioma tiene
          que estar aquí: sin él, quien aterriza en `/ca/aviso-legal` —desde el
          pie de la web catalana o desde un enlace— se queda sin manera de
          volver al castellano. */}
      <div className="flex items-center justify-between gap-6">
        <Link href={p || '/'} className="enlace-linea -ml-1 inline-flex min-h-11 items-center px-1 text-[0.9rem] opacity-60">
          ← {ca ? 'Tornar' : 'Volver'}
        </Link>
        <SelectorIdioma idioma={idioma} />
      </div>
      <h1 className="t-media mb-10 mt-8 !text-[2.4rem]">
        {ca ? 'Política de privacitat' : 'Política de privacidad'}
      </h1>

      <div className="space-y-10">
        <Bloque titulo={ca ? 'Qui tracta les teves dades' : 'Quién trata tus datos'}>
          <p className="t-cuerpo !max-w-none">
            {real(ESTUDIO.legal.razonSocial) ?? nombre}
            {real(ESTUDIO.legal.nif) && `, NIF ${ESTUDIO.legal.nif}`}
            {domicilio() && (ca ? `, amb domicili a ${domicilio()}` : `, con domicilio en ${domicilio()}`)}
            {correo && (ca ? `. Ens pots escriure a ${correo}` : `. Puedes escribirnos a ${correo}`)}.
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Quines dades recollim i per a què' : 'Qué datos recogemos y para qué'}>
          <ul className="t-cuerpo !max-w-none list-disc space-y-3 pl-5">
            <li>
              <strong>{ca ? 'Sol·licitud de plaça:' : 'Solicitud de plaza:'}</strong>{' '}
              {ca
                ? "nom, correu, telèfon si el dones, el curs que t'interessa i el que ens expliquis. Serveix per gestionar la teva sol·licitud i contestar-te. Base legal: el teu consentiment i els passos previs a un contracte."
                : 'nombre, correo, teléfono si lo das, el curso que te interesa y lo que nos cuentes. Se usa para gestionar tu solicitud y contestarte. Base legal: tu consentimiento y los pasos previos a un contrato.'}
            </li>
            <li>
              <strong>{ca ? 'Plaça per a un menor:' : 'Plaza para un menor:'}</strong>{' '}
              {ca
                ? "si la plaça és per a un menor d'edat, el formulari el rebem del pare, la mare o el tutor, i les dades de contacte són les seves. Del menor només demanem el nom i l'edat o el curs, per formar els grups. Base legal: el consentiment de qui té la pàtria potestat o la tutela."
                : 'si la plaza es para un menor de edad, el formulario lo recibimos del padre, la madre o el tutor, y los datos de contacto son los suyos. Del menor solo pedimos el nombre y la edad o el curso, para formar los grupos. Base legal: el consentimiento de quien tiene la patria potestad o la tutela.'}
            </li>
            <li>
              <strong>{ca ? 'Formulari de contacte:' : 'Formulario de contacto:'}</strong>{' '}
              {ca
                ? 'nom, correu, telèfon si el dones i el teu missatge, per respondre’t. Base legal: el teu consentiment.'
                : 'nombre, correo, teléfono si lo das y tu mensaje, para responderte. Base legal: tu consentimiento.'}
            </li>
            <li>
              <strong>{ca ? 'Butlletí:' : 'Newsletter:'}</strong>{' '}
              {ca
                ? 'el teu correu, per enviar-te novetats sobre cursos. Base legal: el teu consentiment, que pots retirar quan vulguis.'
                : 'tu correo, para enviarte novedades sobre cursos. Base legal: tu consentimiento, que puedes retirar cuando quieras.'}
            </li>
          </ul>
        </Bloque>

        <Bloque titulo={ca ? 'Quant de temps les guardem' : 'Cuánto tiempo los guardamos'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? 'Les sol·licituds i els missatges es conserven mentre duri la relació i després el temps necessari per atendre responsabilitats legals. Els correus del butlletí, fins que et donis de baixa.'
              : 'Las solicitudes y los mensajes se conservan mientras dure la relación y después el tiempo necesario para atender responsabilidades legales. Los correos de la newsletter, hasta que te des de baja.'}
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Qui més les veu' : 'Quién más los ve'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? 'Ningú més les fa servir per a finalitats pròpies. Treballem amb proveïdors que només les tracten per encàrrec nostre: '
              : 'Nadie más los usa para sus propios fines. Trabajamos con proveedores que solo los tratan por encargo nuestro: '}
            <strong>Neon</strong>
            {ca ? ' (base de dades, servidors a la Unió Europea), ' : ' (base de datos, servidores en la Unión Europea), '}
            <strong>Vercel</strong>
            {ca ? " (allotjament del web) i " : ' (alojamiento de la web) y '}
            <strong>Resend</strong>
            {ca ? ' (enviament dels correus d’avís)' : ' (envío de los correos de aviso)'}
            {real(ESTUDIO.analitica.ga4) && (
              <>
                {ca ? ' i ' : ' y '}
                <strong>Google</strong>
                {ca
                  ? " (analítica del web, només si l'acceptes; pot tractar dades fora de la Unió Europea)"
                  : ' (analítica de la web, solo si la aceptas; puede tratar datos fuera de la Unión Europea)'}
              </>
            )}
            {ca ? '. No venem ni cedim dades a tercers.' : '. No vendemos ni cedemos datos a terceros.'}
          </p>
        </Bloque>

        <Bloque titulo={ca ? 'Galetes' : 'Cookies'}>
          {/* Este apartado cambia solo según haya analítica o no. Un texto fijo
              que jurase «no usamos cookies» el día que se enciende Google
              Analytics convertiría la política en mentira sin que nadie lo
              notara. */}
          {real(ESTUDIO.analitica.ga4) ? (
            <p className="t-cuerpo !max-w-none">
              {ca
                ? "Aquest web fa servir Google Analytics per saber quanta gent el visita i quins cursos es miren més. No es carrega fins que tu ho acceptes al cartell que apareix en entrar: si dius que no, no s'instal·la cap galeta d'anàlisi. La teva resposta es guarda al teu propi navegador, i pots canviar-la esborrant les dades del lloc. No hi ha galetes de publicitat ni de xarxes socials. L'única galeta tècnica manté oberta la sessió del tauler de gestió: només la rep qui administra el web."
                : 'Esta web usa Google Analytics para saber cuánta gente la visita y qué cursos se miran más. No se carga hasta que tú lo aceptas en el aviso que aparece al entrar: si dices que no, no se instala ninguna cookie de análisis. Tu respuesta se guarda en tu propio navegador, y puedes cambiarla borrando los datos del sitio. No hay cookies de publicidad ni de redes sociales. La única cookie técnica mantiene abierta la sesión del panel de gestión: solo la recibe quien administra la web.'}
            </p>
          ) : (
            <p className="t-cuerpo !max-w-none">
              {ca
                ? "Aquest web no fa servir galetes d'analítica, de publicitat ni de xarxes socials. L'única galeta que existeix és tècnica i serveix per mantenir oberta la sessió del tauler de gestió: només la rep qui administra el web, no les visites."
                : 'Esta web no usa cookies de analítica, publicidad ni redes sociales. La única cookie que existe es técnica y sirve para mantener abierta la sesión del panel de gestión: solo la recibe quien administra la web, no los visitantes.'}
            </p>
          )}
        </Bloque>

        <Bloque titulo={ca ? 'Els teus drets' : 'Tus derechos'}>
          <p className="t-cuerpo !max-w-none">
            {ca
              ? "Pots demanar-nos accés a les teves dades, la rectificació o la supressió, oposar-te al tractament o limitar-lo, i sol·licitar-ne la portabilitat"
              : 'Puedes pedirnos acceso a tus datos, su rectificación o su supresión, oponerte al tratamiento o limitarlo, y solicitar su portabilidad'}
            {correo && (
              <>
                {ca ? ' escrivint a ' : ' escribiendo a '}
                <a href={`mailto:${correo}`} className="enlace-linea">
                  {correo}
                </a>
              </>
            )}
            .{' '}
            {ca
              ? "Si creus que no t'atenem com cal, pots reclamar davant l'Agència Espanyola de Protecció de Dades (aepd.es)."
              : 'Si crees que no te atendemos como debemos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).'}
          </p>
        </Bloque>
      </div>
    </main>
  )
}

/* ─────────────────────────── Piezas ─────────────────────────── */

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="t-media mb-4 !text-[1.5rem]">{titulo}</h2>
      {children}
    </section>
  )
}

/* El aviso de dato que falta también se traduce: «pendiente» en castellano en
   mitad de un avís legal catalán delata que la traducción está a medias. */
function Fila({
  etiqueta,
  valor,
  idioma,
}: {
  etiqueta: string
  valor: string | null
  idioma: Idioma
}) {
  return (
    <p className="t-cuerpo !max-w-none">
      <span className="opacity-55">{etiqueta}: </span>
      {valor ?? (
        <em className="text-[var(--color-acento)]">
          {idioma === 'ca' ? 'pendent' : 'pendiente'}
        </em>
      )}
    </p>
  )
}
