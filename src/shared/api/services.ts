import type { ApiClient } from './client'
import type { components as Tickets } from './generated/ticket-service'
import type { components as Users } from './generated/user-service'
import type { components as Reports } from './generated/reporting-service'
import type { components as Notifications } from './generated/notification-service'
import type {
  FiltrosTickets,
  FiltrosNotificaciones,
  FiltrosReportes,
  Ticket,
  Usuario,
} from './types'

export function crearServicios(api: ApiClient) {
  return {
    listarTickets: (query: FiltrosTickets, signal?: AbortSignal) =>
      api.request<Tickets['schemas']['PaginaTicket']>('/api/tickets', {
        query,
        signal,
      }),
    obtenerTicket: (id: string, signal?: AbortSignal) =>
      api.request<Ticket>('/api/tickets/' + encodeURIComponent(id), { signal }),
    // Sin reintentos: crear no es idempotente y un reintento podría duplicar el ticket.
    crearTicket: (body: Tickets['schemas']['CrearTicketRequest']) =>
      api.request<Ticket>('/api/tickets', { method: 'POST', body }),
    asignarTicket: (
      id: string,
      body: Tickets['schemas']['AsignarTicketRequest'],
    ) =>
      api.request<Ticket>(
        '/api/tickets/' + encodeURIComponent(id) + '/asignacion',
        { method: 'PATCH', body },
      ),
    cambiarEstado: (
      id: string,
      body: Tickets['schemas']['CambiarEstadoRequest'],
    ) =>
      api.request<Ticket>(
        '/api/tickets/' + encodeURIComponent(id) + '/estado',
        { method: 'PATCH', body },
      ),
    reclasificar: (id: string) =>
      api.request<Ticket>(
        '/api/tickets/' + encodeURIComponent(id) + '/reclasificacion',
        { method: 'POST' },
      ),
    async listarAgentes(signal?: AbortSignal): Promise<Usuario[]> {
      const usuarios: Usuario[] = []
      let page = 0
      let totalPages = 1
      do {
        const response = await api.request<Users['schemas']['PaginaUsuarios']>(
          '/api/usuarios',
          { query: { rol: 'AGENTE', page, size: 100 }, signal },
        )
        usuarios.push(...response.content.filter((usuario) => usuario.activo))
        totalPages = response.totalPages
        page++
      } while (page < totalPages)
      return usuarios
    },
    resumen: (signal?: AbortSignal) =>
      api.request<Reports['schemas']['ResumenDto']>('/api/reportes/resumen', {
        signal,
      }),
    sla: (signal?: AbortSignal) =>
      api.request<Reports['schemas']['SlaDto']>('/api/reportes/sla', {
        signal,
      }),
    ticketsReporte: (query: FiltrosReportes, signal?: AbortSignal) =>
      api.request<Reports['schemas']['PaginaTicketsDto']>(
        '/api/reportes/tickets',
        { query, signal },
      ),
    notificaciones: (query: FiltrosNotificaciones, signal?: AbortSignal) =>
      api.request<
        Notifications['schemas']['OutputPagination_OutputNotificacion_']
      >('/api/notificaciones', { query, signal }),
  }
}
