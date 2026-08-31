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
  horario: { es: string; ca: string; schema: string }
  redes: { instagram: string; facebook: string; youtube: string; tiktok: string }
  legal: { razonSocial: string; nif: string; encargados: string }
  analitica: { ga4: string }
}

export const ESTUDIO: Estudio = {
  /** Nombre comercial tal cual se escribe en facturas y en Google. */
  nombre: 'Artés Espai Creatiu',
  /** Cómo se lee en una frase: «en NOMBRE enseñamos…». */
  nombreCorto: 'Artés Espai Creatiu',
  /** Dominio sin protocolo, p. ej. `estudio.com`. */
  dominio: 'artesespaicreatiu.es',
  /** Con https y sin barra final. Se usa en canonical, sitemap y schema. */
  url: 'https://artesespaicreatiu.es',

  /** Frase de una línea. Debe decir el OFICIO, no la marca: un titular que
   *  solo repite el nombre deja la web muda para Google y para el visitante. */
  titular: 'Vidrieras emplomadas, dibujo, costura y manualidades en Artés',
  descripcion:
    'Taller de vidrieras emplomadas, dibujo, costura y manualidades en Artés. Grupos para niños y para adultos, con clase de prueba gratuita.',

  contacto: {
    telefono: '620 297 425',
    /** Mismo número en formato internacional, sin espacios: +34600000000 */
    telefonoE164: '+34620297425',
    whatsapp: '+34 620 297 425',
    email: 'info@artesespaicreatiu.com',
    /** Buzón que recibe los avisos de inscripción. Puede ser otro. */
    emailAvisos: 'info@artesespaicreatiu.com',
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
    latitud: '41.795746',
    longitud: '1.949413',
  },

  /**
   * El horario, escrito dos veces a propósito: una para las personas y otra
   * para Google.
   *
   * ⚠️ Las tres tienen que decir EXACTAMENTE lo mismo. Si un día cambia el
   * horario y sólo se toca una, la web dirá una cosa, la ficha de Google otra
   * y nadie verá un error en ninguna parte: sencillamente habrá gente delante
   * de una puerta cerrada.
   */
  horario: {
    /** Lo que se pinta en el pie y en el bloque de contacto. */
    es: 'De lunes a viernes, de 9:00 a 13:00 y de 15:00 a 20:30',
    ca: 'De dilluns a divendres, de 9:00 a 13:00 i de 15:00 a 20:30',
    /** Formato schema.org, el que lee Google. */
    schema: 'Mo-Fr 09:00-13:00,Mo-Fr 15:00-20:30',
  },

  redes: {
    instagram: 'https://instagram.com/art_esespaicreatiu',
    facebook: '',
    youtube: '',
    tiktok: '',
  },

  /**
   * Medición de visitas.
   *
   * Vacío = NO se carga nada, no hay cartel de cookies y la política puede
   * seguir diciendo, con verdad, que esta web no lleva analítica.
   *
   * En cuanto aquí haya un identificador de Google Analytics («G-XXXXXXX»),
   * la web enseña el cartel de consentimiento y sólo carga Google si el
   * visitante dice que sí. Ese orden no es un adorno: cargar analítica antes
   * de preguntar es lo que multa la Agencia de Protección de Datos.
   */
  analitica: { ga4: '' },

  legal: {
    /** Titular real que firma el aviso legal. */
    razonSocial: 'Silvia Cano Herrera',
    nif: '39384144W',
    /** Dónde se guardan los datos de los formularios, para la política. */
    encargados: 'Neon (Postgres, UE) y Resend (correo)',
  },
}

/** El horario tal como se le enseña a una persona, en su idioma. */
export function horarioEn(idioma: string): string {
  return idioma === 'ca' ? ESTUDIO.horario.ca : ESTUDIO.horario.es
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
