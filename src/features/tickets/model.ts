import type {
  Categoria,
  EstadoTicket,
  Prioridad,
  Ticket,
} from '../../shared/api/types'

export const estados: Record<EstadoTicket, string> = {
  NUEVO: 'Nuevo',
  PENDIENTE_CLASIFICACION: 'Pendiente de clasificación',
  CLASIFICADO: 'Clasificado',
  ASIGNADO: 'Asignado',
  EN_CURSO: 'En curso',
  ESCALADO: 'Escalado',
  RESUELTO: 'Resuelto',
  CERRADO: 'Cerrado',
}
export const prioridades: Record<Prioridad, string> = {
  P1: 'P1 · Crítica',
  P2: 'P2 · Alta',
  P3: 'P3 · Media',
  P4: 'P4 · Baja',
}
export const categorias: Record<Categoria, string> = {
  INCIDENTE: 'Incidente',
  SOLICITUD: 'Solicitud',
  CONSULTA: 'Consulta',
  BUG: 'Bug',
}

// Sección 8.4: guía para ofrecer acciones; el backend siempre valida la transición.
const transiciones: Record<EstadoTicket, EstadoTicket[]> = {
  NUEVO: [],
  PENDIENTE_CLASIFICACION: [],
  CLASIFICADO: [],
  ASIGNADO: ['EN_CURSO', 'ESCALADO'],
  EN_CURSO: ['RESUELTO', 'ESCALADO'],
  ESCALADO: ['EN_CURSO'],
  RESUELTO: ['EN_CURSO', 'CERRADO'],
  CERRADO: [],
}
export function estadosDisponibles(
  ticket: Pick<Ticket, 'estado' | 'agenteAsignadoId'>,
) {
  return transiciones[ticket.estado].filter(
    (estado) =>
      !['EN_CURSO', 'RESUELTO'].includes(estado) ||
      Boolean(ticket.agenteAsignadoId),
  )
}
export function puedeAsignar(ticket: Pick<Ticket, 'estado'>) {
  return ticket.estado === 'CLASIFICADO' || ticket.estado === 'ESCALADO'
}
export function puedeReclasificar(ticket: Pick<Ticket, 'estado'>) {
  return (
    ticket.estado === 'PENDIENTE_CLASIFICACION' ||
    ticket.estado === 'CLASIFICADO'
  )
}
export function estaPendiente(ticket: Pick<Ticket, 'estado'>) {
  return (
    ticket.estado === 'NUEVO' || ticket.estado === 'PENDIENTE_CLASIFICACION'
  )
}
export function slaVencido(
  ticket: Pick<Ticket, 'estado' | 'fechaLimiteSla'>,
  ahora = Date.now(),
) {
  return Boolean(
    ticket.fechaLimiteSla &&
    !['RESUELTO', 'CERRADO'].includes(ticket.estado) &&
    new Date(ticket.fechaLimiteSla).getTime() < ahora,
  )
}
export function fecha(valor: string | null | undefined) {
  if (!valor) return 'Sin fecha'
  const date = new Date(valor)
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible'
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
export function textoEnum(valor: string | null | undefined) {
  return valor
    ? valor
        .toLowerCase()
        .replaceAll('_', ' ')
        .replace(/^./, (letra) => letra.toUpperCase())
    : 'Sin clasificación'
}
