/** Convierte «Cerámica: torno básico» en «ceramica-torno-basico».
 *
 *  Vive fuera de las server actions a propósito: en un fichero `'use server'`
 *  todo lo exportado tiene que ser una función asíncrona, y esto es una
 *  utilidad que también usa el navegador para previsualizar la URL. */
export function aSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** Formatea céntimos como precio español: 18000 → «180 €». */
export function euros(centimos: number | null): string | null {
  if (centimos === null || !Number.isFinite(centimos)) return null
  const valor = centimos / 100
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: valor % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

/** Una línea por elemento, sin vacíos: así se guardan temarios y listas. */
export function lineas(valor: string | null): string[] {
  if (!valor) return []
  return valor
    .split('\n')
    .map((l) => l.trim().replace(/^[-·•*]\s*/, ''))
    .filter(Boolean)
}
