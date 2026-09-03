/**
 * Reglas que tienen que saber a la vez el servidor y el navegador.
 *
 * Vive suelto de `lib/usuarios.ts` a propósito: aquel importa `node:crypto` y
 * la conexión a la base, y un formulario del panel es un componente de cliente.
 * Importarlo desde allí se lleva medio servidor al paquete del navegador (y no
 * compila).
 */

/** Longitud mínima de una contraseña del panel. */
export const CLAVE_MINIMA = 10
