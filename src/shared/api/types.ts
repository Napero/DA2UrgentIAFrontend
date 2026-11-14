import type {
  components as Tickets,
  operations as TicketOperations,
} from './generated/ticket-service'
import type { components as Users } from './generated/user-service'
import type {
  components as Reports,
  paths as ReportPaths,
} from './generated/reporting-service'
import type {
  components as Notifications,
  operations as NotificationOperations,
} from './generated/notification-service'

export type Ticket = Tickets['schemas']['Ticket']
export type EstadoTicket = Tickets['schemas']['EstadoTicket']
export type Prioridad = Tickets['schemas']['Prioridad']
export type Categoria = Tickets['schemas']['Categoria']
export type Usuario = Users['schemas']['Usuario']
export type Rol = Users['schemas']['Rol']
export type Sesion = Pick<
  Users['schemas']['LoginResponse'],
  'accessToken' | 'usuario'
>
export type Resumen = Reports['schemas']['ResumenDto']
export type Sla = Reports['schemas']['SlaDto']
export type TicketView = Reports['schemas']['TicketViewDto']
export type Notificacion = Notifications['schemas']['OutputNotificacion']
export type FiltrosTickets = NonNullable<
  TicketOperations['listarTickets']['parameters']['query']
>
export type FiltrosReportes = NonNullable<
  ReportPaths['/api/reportes/tickets']['get']['parameters']['query']
>
export type FiltrosNotificaciones = NonNullable<
  NotificationOperations['listar_notificaciones_api_notificaciones_get']['parameters']['query']
>
