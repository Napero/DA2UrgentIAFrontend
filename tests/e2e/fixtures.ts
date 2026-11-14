import type { Page } from '@playwright/test'
import type {
  Notificacion,
  Resumen,
  Sla,
  Ticket,
  Usuario,
} from '../../src/shared/api/types'

export const id = (numero: number) =>
  '7c9e6679-7425-40de-944b-' + String(numero).padStart(12, '0')
export const agenteId = 'b1c2d3e4-0000-4000-8000-000000000002'
const ahora = '2026-11-14T14:00:00Z'
export function crearTicket(numero = 1, cambios: Partial<Ticket> = {}): Ticket {
  return {
    id: id(numero),
    titulo:
      numero === 1
        ? 'Producción caída en login'
        : 'Solicitud de soporte #' + numero,
    descripcion: 'La aplicación no permite ingresar a los usuarios del área.',
    solicitanteId: id(99),
    agenteAsignadoId: null,
    estado: 'CLASIFICADO',
    prioridad: numero <= 2 ? 'P1' : 'P3',
    fechaLimiteSla: '2026-11-14T15:00:00Z',
    requiereRevisionManual: false,
    motivoEscalamiento: null,
    clasificacion: {
      categoria: numero <= 2 ? 'INCIDENTE' : 'CONSULTA',
      urgencia: 'ALTA',
      impacto: 'ALTO',
      moduloAfectado: 'AUTENTICACION',
      requiereEscalamiento: false,
      confianza: 0.9,
      fecha: ahora,
      justificacion: 'Clasificación de prueba.',
    },
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
    ...cambios,
  }
}
const resumen: Resumen = {
  total: 42,
  abiertos: 30,
  escalados: 3,
  slaVencidos: 2,
  porPrioridad: { P1: 3, P2: 5, P3: 12, P4: 20, SIN_PRIORIDAD: 2 },
  porCategoria: {
    INCIDENTE: 18,
    SOLICITUD: 10,
    CONSULTA: 8,
    BUG: 4,
    SIN_CATEGORIA: 2,
  },
  porEstado: {
    NUEVO: 0,
    PENDIENTE_CLASIFICACION: 2,
    CLASIFICADO: 10,
    ASIGNADO: 8,
    EN_CURSO: 7,
    ESCALADO: 3,
    RESUELTO: 8,
    CERRADO: 4,
  },
  generadoEn: ahora,
}
const sla: Sla = {
  vencidos: [
    {
      ticketId: id(1),
      titulo: 'Producción caída en login',
      prioridad: 'P1',
      estado: 'EN_CURSO',
      fechaLimiteSla: ahora,
      horasVencido: 4.2,
    },
  ],
  cumplimientoPorPrioridad: {
    P1: { resueltos: 4, enTermino: 3, porcentaje: 75 },
    P2: { resueltos: 0, enTermino: 0, porcentaje: null },
    P3: { resueltos: 2, enTermino: 2, porcentaje: 100 },
    P4: { resueltos: 1, enTermino: 0, porcentaje: 0 },
  },
  generadoEn: ahora,
}
const notificaciones: Notificacion[] = [
  {
    id: 'mongo-1',
    eventId: id(70),
    ticketId: id(1),
    tipoEvento: 'TicketEscalado',
    destinatario: 'GRUPO:GUARDIA',
    canal: 'EMAIL_SIMULADO',
    asunto: 'Ticket escalado a guardia',
    mensaje: 'El ticket necesita atención inmediata.',
    estado: 'ENVIADA',
    fecha: ahora,
  },
  {
    id: 'mongo-2',
    eventId: id(71),
    ticketId: id(2),
    tipoEvento: 'TicketResuelto',
    destinatario: 'USUARIO:' + id(99),
    canal: 'EMAIL_SIMULADO',
    asunto: 'Tu ticket fue resuelto',
    mensaje: 'No se pudo enviar el aviso.',
    estado: 'FALLIDA',
    fecha: ahora,
  },
]

export async function mockApi(page: Page) {
  const state = {
    tickets: Array.from({ length: 23 }, (_, index) => crearTicket(index + 1)),
    llamadas: [] as {
      path: string
      method: string
      body: unknown
      token: string | undefined
    }[],
    error: null as {
      path: string
      status: number
      mensaje: string
      method?: string
    } | null,
    pendientes: 0,
  }
  await page.route('http://localhost:8080/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const body: unknown = request.postDataJSON()
    state.llamadas.push({
      path: url.pathname + url.search,
      method,
      body,
      token: request.headers().authorization,
    })
    const responder = (value: unknown, status = 200) =>
      route.fulfill({
        status,
        json: value,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5175',
          'Access-Control-Expose-Headers': 'X-Correlation-Id',
          'X-Correlation-Id': 'correlacion-e2e',
        },
      })
    if (
      state.error?.path === url.pathname &&
      (!state.error.method || state.error.method === method)
    )
      return responder(
        {
          codigo: 'ERROR_INTERNO',
          mensaje: state.error.mensaje,
          correlationId: 'correlacion-e2e',
          timestamp: ahora,
          path: url.pathname,
        },
        state.error.status,
      )
    const pageNumber = Number(url.searchParams.get('page') ?? 0)
    const size = Number(url.searchParams.get('size') ?? 20)
    const paginar = <T>(items: T[]) => ({
      content: items.slice(pageNumber * size, (pageNumber + 1) * size),
      page: pageNumber,
      size,
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
    })
    if (url.pathname === '/api/tickets') {
      const filtrados = state.tickets.filter(
        (ticket) =>
          (!url.searchParams.get('estado') ||
            ticket.estado === url.searchParams.get('estado')) &&
          (!url.searchParams.get('prioridad') ||
            ticket.prioridad === url.searchParams.get('prioridad')) &&
          (!url.searchParams.get('categoria') ||
            ticket.clasificacion?.categoria ===
              url.searchParams.get('categoria')),
      )
      return responder(paginar(filtrados))
    }
    if (url.pathname === '/api/usuarios') {
      const agente: Usuario = {
        id: agenteId,
        nombre: 'Agente de guardia',
        email: 'guardia@urgentia.local',
        rol: 'AGENTE',
        activo: true,
        fechaAlta: ahora,
      }
      return responder({
        content:
          pageNumber === 0
            ? [
                agente,
                {
                  ...agente,
                  id: id(88),
                  nombre: 'Agente inactivo',
                  activo: false,
                },
              ]
            : [{ ...agente, id: id(89), nombre: 'Otro agente activo' }],
        page: pageNumber,
        size,
        totalElements: 3,
        totalPages: 2,
      })
    }
    if (url.pathname.startsWith('/api/tickets/')) {
      const [, , , ticketId, accion] = url.pathname.split('/')
      const ticket = state.tickets.find((ticket) => ticket.id === ticketId)
      if (!ticket)
        return responder(
          { codigo: 'NO_ENCONTRADO', mensaje: 'No existe el ticket.' },
          404,
        )
      if (method === 'GET') {
        if (state.pendientes > 0) {
          state.pendientes--
          return responder({
            ...ticket,
            estado: 'PENDIENTE_CLASIFICACION',
            clasificacion: null,
            prioridad: null,
            fechaLimiteSla: null,
          })
        }
        return responder(ticket)
      }
      if (accion === 'asignacion') {
        ticket.agenteAsignadoId = (body as { agenteId: string }).agenteId
        if (ticket.estado === 'CLASIFICADO') ticket.estado = 'ASIGNADO'
      } else if (accion === 'estado') {
        ticket.estado = (body as { estado: Ticket['estado'] }).estado
      } else if (accion === 'reclasificacion') {
        ticket.estado = 'CLASIFICADO'
        ticket.prioridad = 'P1'
      }
      ticket.fechaActualizacion = new Date().toISOString()
      return responder(ticket)
    }
    if (url.pathname === '/api/reportes/resumen') return responder(resumen)
    if (url.pathname === '/api/reportes/sla') return responder(sla)
    if (url.pathname === '/api/reportes/tickets')
      return responder(
        paginar(
          state.tickets
            .filter(
              (ticket) =>
                (!url.searchParams.get('estado') ||
                  ticket.estado === url.searchParams.get('estado')) &&
                (!url.searchParams.get('prioridad') ||
                  ticket.prioridad === url.searchParams.get('prioridad')),
            )
            .map((ticket) => ({
              ticketId: ticket.id,
              titulo: ticket.titulo,
              estado: ticket.estado,
              prioridad: ticket.prioridad ?? null,
              categoria: ticket.clasificacion?.categoria ?? null,
              moduloAfectado: ticket.clasificacion?.moduloAfectado ?? null,
              escalado: ticket.estado === 'ESCALADO',
              solicitanteId: ticket.solicitanteId,
              agenteAsignadoId: ticket.agenteAsignadoId ?? null,
              fechaCreacion: ticket.fechaCreacion,
              fechaLimiteSla: ticket.fechaLimiteSla ?? null,
              fechaResolucion: null,
              ultimoEventoEn: ticket.fechaActualizacion,
            })),
        ),
      )
    if (url.pathname === '/api/notificaciones')
      return responder(
        paginar(
          notificaciones.filter(
            (item) =>
              (!url.searchParams.get('ticketId') ||
                item.ticketId === url.searchParams.get('ticketId')) &&
              (!url.searchParams.get('destinatario') ||
                item.destinatario === url.searchParams.get('destinatario')),
          ),
        ),
      )
    return responder(
      { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta sin fixture.' },
      404,
    )
  })
  return state
}

export function abrir(page: Page, ruta: string, rol: string = 'AGENTE') {
  return page.goto(
    '/tests/e2e/harness.html?' + new URLSearchParams({ ruta, rol }).toString(),
  )
}
