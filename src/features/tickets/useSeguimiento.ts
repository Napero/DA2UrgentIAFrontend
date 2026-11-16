import { useEffect, useMemo, useState } from 'react'
import type { Ticket } from '../../shared/api/types'
import { useServicios } from '../../shared/session/context'
import { estaPendiente } from './model'
import { INTERVALO_SEGUIMIENTO_MS, masReciente } from './seguimiento'

/**
 * Sigue los tickets pendientes de clasificación: cada 5 segundos consulta solo esos
 * (GET /api/tickets/{id}) y devuelve la lista con los datos al día. No recarga el listado
 * completo, así la pantalla no parpadea. Sin pendientes o con la pestaña oculta, no consulta.
 */
export function useSeguimiento(tickets: Ticket[] | undefined) {
  const servicios = useServicios()
  const [seguidos, setSeguidos] = useState<Record<string, Ticket>>({})

  const vista = useMemo(
    () => tickets?.map((ticket) => masReciente(ticket, seguidos[ticket.id])),
    [tickets, seguidos],
  )
  const pendientes = (vista ?? [])
    .filter(estaPendiente)
    .map((ticket) => ticket.id)
    .join(',')

  useEffect(() => {
    if (!pendientes) return
    const ids = pendientes.split(',')
    const controller = new AbortController()
    const intervalo = window.setInterval(() => {
      if (document.hidden) return
      for (const id of ids)
        servicios.obtenerTicket(id, controller.signal).then(
          (ticket) =>
            setSeguidos((anteriores) => ({
              ...anteriores,
              [ticket.id]: ticket,
            })),
          // Un fallo puntual se reintenta en la próxima vuelta. Un 401 ya cierra la sesión
          // desde el cliente de API.
          () => undefined,
        )
    }, INTERVALO_SEGUIMIENTO_MS)
    return () => {
      window.clearInterval(intervalo)
      controller.abort()
    }
  }, [pendientes, servicios])

  return {
    tickets: vista,
    cantidadPendientes: pendientes ? pendientes.split(',').length : 0,
  }
}
