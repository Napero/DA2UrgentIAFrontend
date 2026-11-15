import { expect, test, type Page } from '@playwright/test'
import type { Ticket } from '../../src/shared/api/types'
import { abrir, crearTicket, id } from './fixtures'

// Mis tickets (P3). Entra con el harness de P6 como SOLICITANTE y simula el gateway.
// El seguimiento se prueba con el reloj simulado de Playwright, sin esperar 5 s reales.

const pendiente = (numero: number): Ticket =>
  crearTicket(numero, {
    estado: 'PENDIENTE_CLASIFICACION',
    prioridad: null,
    fechaLimiteSla: null,
    motivoEscalamiento: null,
    clasificacion: null,
    fechaActualizacion: '2026-11-14T14:00:00Z',
  })
const clasificado = (numero: number): Ticket =>
  crearTicket(numero, { fechaActualizacion: '2026-11-14T14:00:05Z' })

async function mockGateway(
  page: Page,
  opciones: {
    lista: Ticket[]
    // Lo que devuelve GET /api/tickets/{id} en cada consulta; se repite el último.
    detalle?: Record<string, (Ticket | 404)[]>
  },
) {
  const estado = { listados: [] as string[], detalles: [] as string[] }
  await page.route('http://localhost:8080/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:5175',
      'Access-Control-Expose-Headers': 'X-Correlation-Id',
      'X-Correlation-Id': 'correlacion-e2e',
    }
    if (url.pathname === '/api/tickets') {
      estado.listados.push(url.search)
      const filtro = url.searchParams.get('estado')
      const content = opciones.lista.filter(
        (ticket) => !filtro || ticket.estado === filtro,
      )
      return route.fulfill({
        headers,
        json: {
          content,
          page: 0,
          size: 20,
          totalElements: content.length,
          totalPages: content.length ? 1 : 0,
        },
      })
    }
    const ticketId = url.pathname.match(/^\/api\/tickets\/([^/]+)$/)?.[1]
    if (ticketId) {
      estado.detalles.push(ticketId)
      const respuestas = opciones.detalle?.[ticketId] ?? [404]
      const veces = estado.detalles.filter((visto) => visto === ticketId).length
      const respuesta =
        respuestas[Math.min(veces, respuestas.length) - 1] ?? 404
      if (respuesta === 404)
        return route.fulfill({
          status: 404,
          headers,
          json: {
            codigo: 'NO_ENCONTRADO',
            mensaje: 'No existe el ticket ' + ticketId,
          },
        })
      return route.fulfill({ headers, json: respuesta })
    }
    return route.fulfill({
      status: 404,
      headers,
      json: { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta sin fixture.' },
    })
  })
  return estado
}

test('lista los tickets propios, filtra por estado y lleva al detalle de solo lectura', async ({
  page,
}) => {
  const estado = await mockGateway(page, {
    lista: [crearTicket(1), crearTicket(3)],
  })
  await abrir(page, '/mis-tickets', 'SOLICITANTE')

  const enlace = page.getByRole('link', { name: 'Producción caída en login' })
  await expect(enlace).toHaveAttribute('href', '/mis-tickets/' + id(1))
  await expect(
    page.getByRole('link', { name: 'Solicitud de soporte #3' }),
  ).toBeVisible()
  await expect(
    page.getByRole('combobox', { name: 'Categoría', exact: true }),
  ).toHaveCount(0)

  await page
    .getByRole('combobox', { name: 'Estado', exact: true })
    .selectOption('ESCALADO')
  await expect(page).toHaveURL(/estado=ESCALADO/)
  await expect(
    page.getByRole('link', { name: 'Solicitud de soporte #3' }),
  ).toHaveCount(0)
  expect(
    estado.listados.some((query) => query.includes('estado=ESCALADO')),
  ).toBe(true)
})

test('sin tickets invita a crear el primero', async ({ page }) => {
  await mockGateway(page, { lista: [] })
  await abrir(page, '/mis-tickets', 'SOLICITANTE')

  await expect(
    page.getByRole('heading', { name: 'Todavía no creaste tickets' }),
  ).toBeVisible()
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Crear ticket' }).last(),
  ).toHaveAttribute('href', '/tickets/nuevo')
})

test('un ticket pendiente se actualiza solo, sin recargar la lista, y después deja de consultar', async ({
  page,
}) => {
  await page.clock.install()
  const estado = await mockGateway(page, {
    lista: [pendiente(1), crearTicket(3)],
    detalle: { [id(1)]: [clasificado(1)] },
  })
  await abrir(page, '/mis-tickets', 'SOLICITANTE')
  await expect(page.getByRole('status')).toContainText(
    'Un ticket todavía se está clasificando',
  )
  await expect(
    page.getByRole('table').getByText('Pendiente de clasificación'),
  ).toBeVisible()

  await page.clock.runFor(5000)

  await expect(page.getByRole('table').getByText('P1 · Crítica')).toBeVisible()
  await expect(
    page.getByRole('table').getByText('Pendiente de clasificación'),
  ).toHaveCount(0)
  await expect(page.getByRole('status')).toHaveCount(0)
  expect(estado.listados).toHaveLength(1)
  expect(estado.detalles).toEqual([id(1)])

  await page.clock.runFor(15000)
  expect(estado.detalles).toEqual([id(1)])
})

test('sin tickets pendientes no consulta ninguno por separado', async ({
  page,
}) => {
  await page.clock.install()
  const estado = await mockGateway(page, {
    lista: [crearTicket(1), crearTicket(3)],
  })
  await abrir(page, '/mis-tickets', 'SOLICITANTE')
  await expect(
    page.getByRole('link', { name: 'Producción caída en login' }),
  ).toBeVisible()

  await page.clock.runFor(20000)
  expect(estado.detalles).toHaveLength(0)
  expect(estado.listados).toHaveLength(1)
})

test('el detalle muestra la información y se actualiza mientras está pendiente', async ({
  page,
}) => {
  await page.clock.install()
  await mockGateway(page, {
    lista: [],
    detalle: { [id(1)]: [pendiente(1), clasificado(1)] },
  })
  await abrir(page, '/mis-tickets/' + id(1), 'SOLICITANTE')

  await expect(
    page.getByRole('heading', { name: 'Producción caída en login' }),
  ).toBeVisible()
  await expect(
    page.getByText(
      'La aplicación no permite ingresar a los usuarios del área.',
    ),
  ).toBeVisible()
  await expect(page.getByRole('status')).toContainText(
    'Estamos analizando tu ticket',
  )
  await expect(page.getByText('Todavía sin plazo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Asignar' })).toHaveCount(0)

  await page.clock.runFor(5000)

  await expect(page.getByText('P1 · Crítica')).toBeVisible()
  await expect(page.getByText('Derivado a la guardia')).toBeVisible()
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(
    page.getByRole('link', { name: '← Volver a mis tickets' }),
  ).toHaveAttribute('href', '/mis-tickets')
})

test('un ticket ajeno o inexistente se informa como no encontrado', async ({
  page,
}) => {
  await mockGateway(page, { lista: [] })
  await abrir(page, '/mis-tickets/' + id(7), 'SOLICITANTE')

  await expect(
    page.getByRole('heading', { name: 'No encontramos el recurso' }),
  ).toBeVisible()
})
