import type { Ticket } from '../../shared/api/types'

/** Cada cuánto se vuelve a consultar un ticket que todavía no tiene clasificación. */
export const INTERVALO_SEGUIMIENTO_MS = 5000

/**
 * Entre la versión del listado y la que llegó por el seguimiento, se queda con la más reciente.
 * Así una actualización manual del listado no pisa un dato más nuevo, ni al revés.
 */
export function masReciente(
  delListado: Ticket,
  seguido: Ticket | undefined,
): Ticket {
  if (!seguido) return delListado
  const listado = Date.parse(delListado.fechaActualizacion)
  const nuevo = Date.parse(seguido.fechaActualizacion)
  if (Number.isNaN(nuevo)) return delListado
  if (Number.isNaN(listado)) return seguido
  return nuevo >= listado ? seguido : delListado
}
