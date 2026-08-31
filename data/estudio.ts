/**
 * Datos fijos del estudio.
 *
 * ⛔ TODO lo que lleva `PENDIENTE` está SIN RELLENAR a propósito. No se
 * inventa un teléfono, una dirección ni un horario: si sale a producción un
 * dato falso, el cliente recibe llamadas que no son suyas, Google indexa una
 * dirección que no existe y la ficha de Google Business se cae por datos
 * incoherentes.
 *
 * `faltan()` recorre este fichero y el build se para si queda algo PENDIENTE
 * (ver `scripts/comprobar-datos.mjs`). Es deliberado: **no se despliega con
 * huecos**.
 *
 * Lo que el cliente cambia solo desde el panel (textos, cursos, precios,
 * imágenes) NO vive aquí, vive en la base de datos.
 */

export const PENDIENTE = 'PENDIENTE' as const

/**
 * El tipo se declara con `string` en todas las hojas a propósito.
 *
 * Con `as const`, TypeScript deducía el literal exacto de cada campo y
 * comparaciones como `ESTUDIO.nombre === 'PENDIENTE'` pasaban a ser errores de
 * compilación en cuanto se rellenaba el dato. Justo esas comprobaciones son
 * las que evitan que un «PENDIENTE» salga impreso en la web.
 */
type Estudio = {
  nombre: string
  nombreCorto: string
  dominio: string
  url: string
  titular: string
  descripcion: string
  contacto: {
    telefono: string
    telefonoE164: string
    whatsapp: string
    email: string
    emailAvisos: string
  }
  direccion: {
    calle: string
    codigoPostal: string
    localidad: string
    provincia: string
    pais: string
    latitud: string
    longitud: string
  }
  horario: string
  redes: { instagram: string; facebook: string; youtube: string; tiktok: string }
  legal: { razonSocial: string; nif: string; encargados: string }
}

export const ESTUDIO: Estudio = {
  /** Nombre comercial tal cual se escribe en facturas y en Google. */
  nombre: 'Artés Espai Creatiu',
  /** Cómo se lee en una frase: «en NOMBRE enseñamos…». */
  nombreCorto: 'Artés Espai Creatiu',
  /** Dominio sin protocolo, p. ej. `estudio.com`. */
  dominio: 'artestudicreatiu.es',
  /** Con https y sin barra final. Se usa en canonical, sitemap y schema. */
  url: 'https://artestudicreatiu.es',

  /** Frase de una línea. Debe decir el OFICIO, no la marca: un titular que
   *  solo repite el nombre deja la web muda para Google y para el visitante. */
  titular: PENDIENTE,
  descripcion: PENDIENTE,

  contacto: {
    telefono: PENDIENTE,
    /** Mismo número en formato internacional, sin espacios: +34600000000 */
    telefonoE164: PENDIENTE,
    whatsapp: PENDIENTE,
    email: PENDIENTE,
    /** Buzón que recibe los avisos de inscripción. Puede ser otro. */
    emailAvisos: PENDIENTE,
  },

  direccion: {
    calle: 'Passeig Diagonal, 71',
    codigoPostal: '08271',
    localidad: 'Artés',
    provincia: 'Barcelona',
    pais: 'ES',
    /**
     * Coordenadas del taller. Sin ellas no hay mapa ni schema de sitio.
     *
     * NO se ponen «las de Artés» sacadas de un buscador: eso clava el punto en
     * la plaza del pueblo y manda a la gente a la puerta equivocada. Se sacan
     * del propio portal en Google Maps (botón derecho → copiar coordenadas).
     */
    latitud: PENDIENTE,
    longitud: PENDIENTE,
  },

  /** Horario de atención del taller, formato schema.org: 'Mo-Fr 10:00-20:00'. */
  horario: PENDIENTE,

  redes: {
    instagram: PENDIENTE,
    facebook: PENDIENTE,
    youtube: '',
    tiktok: '',
  },

  legal: {
    /** Titular real que firma el aviso legal. */
    razonSocial: 'Silvia Cano Herrera',
    nif: '39384144W',
    /** Dónde se guardan los datos de los formularios, para la política. */
    encargados: 'Neon (Postgres, UE) y Resend (correo)',
  },
}

/** Devuelve la lista de campos sin rellenar, en notación de ruta. */
export function faltan(objeto: unknown = ESTUDIO, prefijo = ''): string[] {
  if (typeof objeto === 'string') return objeto === PENDIENTE ? [prefijo] : []
  if (objeto && typeof objeto === 'object') {
    return Object.entries(objeto).flatMap(([clave, valor]) =>
      faltan(valor, prefijo ? `${prefijo}.${clave}` : clave),
    )
  }
  return []
}

/**
 * Devuelve el valor solo si es real. Un `PENDIENTE` nunca debe pintarse: es
 * preferible que falte el teléfono en la web a que salga la palabra
 * «PENDIENTE» en el pie, o peor, un número inventado.
 */
export function real(valor: string): string | null {
  const limpio = valor?.trim()
  return limpio && limpio !== PENDIENTE ? limpio : null
}
