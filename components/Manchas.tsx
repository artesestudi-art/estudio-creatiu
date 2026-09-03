/**
 * Las manchas de color de la lámina del logotipo, como fondo de la portada.
 *
 * El estudio no tiene ni una foto del taller, y una portada de artes sin
 * imagen es una portada muerta. La imagen sale de donde tiene que salir: del
 * propio `.ai` del cliente, cuya lámina a color es un fondo crema con cuatro
 * manchas de pintura y unas estrellas. Aquí están esas mismas cuatro manchas,
 * en sus colores exactos, a tamaño de cartel.
 *
 * **Son manchas, no círculos.** Cada silueta se generó con nueve radios
 * desiguales alrededor de un centro y se cerró con curvas: ni un eje de
 * simetría, ni dos lóbulos iguales. Dibujadas a ojo salían óvalos, y un óvalo
 * de color es el fondo que pone cualquiera. Además cada una entra girada, para
 * que dos que compartan aire no se lean como la misma forma repetida.
 *
 * ⚠️ **Dónde puede ir cada una lo decide el contraste, medido.** Marino sobre
 * una mancha suelta da entre 5,07:1 (azul) y 5,76:1 (mostaza): el titular puede
 * cruzarlas. El texto de cuerpo se queda entre 3,79 y 4,31, **por debajo del
 * 4,5:1** que necesita, así que la entradilla y los botones no pisan ninguna. Y
 * donde dos manchas se cruzan la cosa baja a 3,3:1, de modo que **los cruces
 * van donde no hay una sola letra**.
 *
 * Los cruces son el motivo por el que están: al superponerse con `multiply`
 * sale un color que no está en el kit, igual que cuando se superponen dos capas
 * de pigmento en el taller. Es lo mismo que hace la sección de disciplinas, y
 * ata la portada con el resto de la web.
 *
 * Quién se ve en cada medida lo decide `globals.css` y NO una utilidad de
 * Tailwind: `md:block` gana por orden de hoja a la regla de móvil tumbado, y la
 * malva seguía saliendo debajo de la entradilla justo donde no puede estar.
 *
 * Sin JavaScript: son cuatro formas quietas. La página ya gasta 46 KB en GSAP
 * para las disciplinas y las estrellas; un fondo decorativo no justifica ni un
 * byte más.
 */

type Mancha = {
  /** Trazo orgánico dentro de un lienzo de 200×200. */
  d: string
  color: string
  /** Clase que la coloca. La posición vive en `globals.css` porque cambia
   *  entre móvil y escritorio, y un estilo en línea no entiende de medidas. */
  clase: string
  /** Grados de giro, para que ninguna se lea como copia de otra. */
  giro: number
}

const MANCHAS: Mancha[] = [
  {
    /* La grande, arriba a la derecha. Dos lóbulos arriba y un chorretón
       bajando: es la que cierra el hueco que deja el titular. */
    d: 'M171 95C171 111 160 120 149 130C138 141 119 151 106 157C94 163 89 172 76 166C63 161 35 139 29 125C22 111 33 93 38 81C43 69 46 61 59 52C71 42 98 26 114 23C129 21 143 23 153 35C162 47 172 79 171 95Z',
    color: 'var(--color-marca-mostaza)',
    clase: 'mancha-mostaza',
    giro: -14,
  },
  {
    /* El salmón, cruzándose con la mostaza por debajo. El cruce cae a la
       derecha del titular y muy por encima de los botones: ni una letra. */
    d: 'M170 113C168 131 153 142 141 151C130 159 111 163 101 163C91 164 90 161 81 153C71 146 51 131 43 118C34 106 28 91 31 78C35 64 52 44 64 36C76 27 87 24 101 25C116 26 141 28 153 43C164 57 172 95 170 113Z',
    color: 'var(--color-marca-salmon)',
    clase: 'mancha-salmon',
    giro: 26,
  },
  {
    /* La azul, abajo a la izquierda y muy baja: la entradilla —que es texto de
       cuerpo y no aguanta el contraste— acaba bastante por encima de su borde. */
    d: 'M174 96C176 110 177 132 169 145C160 159 146 177 126 180C106 183 63 172 47 163C32 153 32 137 32 122C32 108 39 88 45 75C51 62 59 52 69 44C80 37 94 28 109 30C123 33 146 50 157 61C168 72 172 82 174 96Z',
    color: 'var(--color-marca-azul)',
    clase: 'mancha-azul',
    giro: -28,
  },
  {
    /* La malva se cruza con la azul en el borde de abajo: el segundo color
       inventado del cartel, y también fuera de todo texto. */
    d: 'M188 103C189 117 184 133 171 146C158 158 129 176 109 178C89 180 62 165 50 158C39 150 44 148 42 135C39 122 32 93 36 78C39 63 51 51 63 44C74 37 89 34 105 37C122 40 150 51 164 62C178 73 187 89 188 103Z',
    color: 'var(--color-marca-malva)',
    clase: 'mancha-malva',
    giro: 40,
  },
]

export default function Manchas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {MANCHAS.map((mancha, i) => (
        <svg
          key={i}
          viewBox="0 0 200 200"
          className={`mancha ${mancha.clase}`}
          style={{ transform: `rotate(${mancha.giro}deg)`, mixBlendMode: 'multiply' }}
        >
          <path d={mancha.d} fill={mancha.color} />
        </svg>
      ))}
    </div>
  )
}
