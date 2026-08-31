/** Piezas sueltas del panel. Nada de librerías: son cuatro cajas y un botón. */

export function Titulo({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <h1 className="text-[22px] font-semibold tracking-tight">{children}</h1>
      {extra}
    </div>
  )
}

export function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-5 ${className}`}>{children}</div>
  )
}

export function Dato({ valor, texto, aviso }: { valor: number | string; texto: string; aviso?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        aviso ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 bg-white'
      }`}
    >
      <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">{valor}</p>
      <p className="mt-1.5 text-[13px] text-neutral-500">{texto}</p>
    </div>
  )
}

export function Vacio({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-5 py-10 text-center text-[14.5px] text-neutral-500">
      {children}
    </div>
  )
}

const COLORES: Record<string, string> = {
  nueva: 'bg-blue-50 text-blue-700 border-blue-200',
  nuevo: 'bg-blue-50 text-blue-700 border-blue-200',
  contactada: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  contestado: 'bg-neutral-100 text-neutral-700 border-neutral-300',
  aceptada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  matriculada: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  lista_espera: 'bg-amber-50 text-amber-800 border-amber-200',
  descartada: 'bg-neutral-50 text-neutral-400 border-neutral-200',
  descartado: 'bg-neutral-50 text-neutral-400 border-neutral-200',
  cerrado: 'bg-neutral-100 text-neutral-700 border-neutral-300',
}

export function Insignia({ estado, texto }: { estado: string; texto: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
        COLORES[estado] ?? 'bg-neutral-100 text-neutral-700 border-neutral-300'
      }`}
    >
      {texto}
    </span>
  )
}

export function Campo({
  etiqueta,
  ayuda,
  children,
}: {
  etiqueta: string
  ayuda?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-neutral-700">{etiqueta}</span>
      {children}
      {ayuda && <span className="mt-1 block text-[12.5px] text-neutral-500">{ayuda}</span>}
    </label>
  )
}

export const claseInput =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[14.5px] outline-none focus:border-neutral-900'

export const claseBoton =
  'rounded-lg bg-neutral-900 px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-neutral-700 disabled:opacity-60'

export const claseBotonSuave =
  'rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-[14px] font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900'

/** Fecha corta y legible. Se calcula en el servidor para que no baile con la
 *  zona horaria del navegador del cliente. */
export function fecha(valor: string): string {
  return new Date(valor).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  })
}
