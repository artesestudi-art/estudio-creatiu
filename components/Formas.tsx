/**
 * La composición de la portada: la rueda de color y la estrella de la marca.
 *
 * El estudio no tiene ni una foto del taller, así que la portada necesita algo
 * suyo. Costó tres intentos llegar aquí, y los tres fallos valen más que la
 * solución:
 *
 * 1. Cuatro manchas orgánicas superpuestas: **pegotes**. Siluetas amorfas
 *    pisándose unas a otras que, por bien generadas que estuvieran, no decían
 *    nada. Una forma sin intención es relleno.
 * 2. Cuatro formas sueltas —disco, estrella, arco, aro—: se leía como una fila
 *    de iconos de plantilla.
 * 3. Tres arcos concéntricos: **un arcoíris**. En un taller que también da
 *    clases a adultos, infantil.
 *
 * Lo que hay ahora es **la rueda de color**: el objeto con el que se aprende a
 * mezclar, dividido en cuatro sectores con los cuatro colores de la lámina del
 * cliente. Pertenece a un estudio de arte y no se puede confundir con otra
 * cosa; es geometría exacta, no una mancha; y los huecos entre sectores dejan
 * respirar el papel, así que ninguna forma toca a otra.
 *
 * Al lado, **la estrella de siete puntas del logotipo**, la misma que firma la
 * marca: el único elemento de la web que se reconoce sin leer nada.
 *
 * ⚠️ El grupo vive en el hueco que deja el titular y **ahí no hay una sola
 * letra**, así que el contraste del texto no entra en la ecuación. La medida y
 * la posición están en `globals.css` porque cambian con la pantalla; la
 * composición va en un `viewBox` de 100×80 y viaja entera.
 *
 * El giro es una animación de CSS sobre los cuatro sectores, no sobre el SVG
 * entero: la estrella y el aro se quedan quietos, y es el contraste entre lo
 * que gira y lo que no lo que hace que el movimiento se lea.
 *
 * Sin JavaScript.
 */

/** La estrella grande del `.ai`, la misma que usa `Estrellas.tsx`. */
const ESTRELLA =
  'M37.80 14.18 C33.10 16.48 28.00 18.28 22.90 19.58 C26.60 23.88 29.90 28.48 32.80 33.28 C28.40 31.28 24.30 28.48 21.00 24.88 C18.00 28.18 15.10 31.48 12.10 34.68 L14.40 20.28 C9.80 22.18 4.90 23.38 0.00 23.88 C4.00 20.58 8.50 17.88 13.30 15.88 C9.00 13.58 5.00 10.78 1.20 7.68 C6.60 9.38 11.80 11.58 16.70 14.28 C17.60 8.98 20.10 3.98 23.60 -0.02 C24.30 5.08 23.90 10.38 22.70 15.38 C22.70 15.38 22.60 15.38 22.60 15.38 C22.80 14.88 32.30 14.18 37.80 14.18'

const CENTRO = { x: 62, y: 39 }

/** Un sector de la rueda, entre dos ángulos en grados. */
function sector(desde: number, hasta: number, radio: number) {
  const punto = (grados: number) => {
    const rad = (grados * Math.PI) / 180
    return [
      (CENTRO.x + radio * Math.cos(rad)).toFixed(2),
      (CENTRO.y + radio * Math.sin(rad)).toFixed(2),
    ]
  }
  const [x1, y1] = punto(desde)
  const [x2, y2] = punto(hasta)
  const largo = hasta - desde > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${radio} ${radio} 0 ${largo} 1 ${x2} ${y2}`
}

/* Cuatro sectores de 74°, con 16° de papel entre uno y otro. Empiezan arriba
   y giran como las agujas del reloj. */
const SECTORES = [
  { desde: -101, hasta: -27, color: 'var(--color-marca-mostaza)' },
  { desde: -11, hasta: 63, color: 'var(--color-marca-salmon)' },
  { desde: 79, hasta: 153, color: 'var(--color-marca-malva)' },
  { desde: 169, hasta: 243, color: 'var(--color-marca-azul)' },
]

export default function Formas() {
  return (
    <svg
      aria-hidden
      className="formas-grupo"
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* La rueda gira. Despacio: una vuelta cada 48 segundos, lo justo para
          que quien se queda leyendo note que la página está viva y que a nadie
          le baile el ojo mientras lee el titular. Quien pide menos movimiento
          la ve quieta —la composición no depende del giro para funcionar—. */}
      <g className="rueda-gira">
        {SECTORES.map((s) => (
          <path
            key={s.color}
            d={sector(s.desde, s.hasta, 28)}
            stroke={s.color}
            strokeWidth="11"
            strokeLinecap="butt"
          />
        ))}
      </g>

      {/* El aro interior, de línea fina: es lo que convierte cuatro trozos de
          color en una rueda, y de paso mete el dibujo —la única disciplina que
          aquí no puede ser una masa de color—. */}
      <circle
        cx={CENTRO.x}
        cy={CENTRO.y}
        r="13"
        stroke="var(--color-marca-marino)"
        strokeWidth="1.1"
      />

      {/* La estrella de la marca, apoyada arriba a la izquierda. 37,84 de ancho
          en su lienzo original; la escala la deja en 22. */}
      <g transform="translate(3 7) scale(0.581)">
        <path d={ESTRELLA} fill="var(--color-marca-marino)" />
      </g>
    </svg>
  )
}
