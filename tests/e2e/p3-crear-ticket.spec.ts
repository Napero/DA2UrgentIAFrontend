import { expect, test, type Page } from '@playwright/test'
import { abrir, crearTicket, id } from './fixtures'

// Crear ticket (P3). Usa el harness de P6 para entrar con un rol y simula POST /api/tickets.

type Respuesta = 'escalado' | 'pendiente' | 'validacion' | 'red'

async function mockCrear(page: Page, respuesta: Respuesta) {
  const estado = {
    pedidos: [] as { body: unknown; token: string | undefined }[],
  }
  await page.route('http://localhost:8080/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:5175',
      'Access-Control-Expose-Headers': 'X-Correlation-Id',
      'X-Correlation-Id': 'correlacion-e2e',
    }
    if (url.pathname === '/api/tickets' && request.method() === 'POST') {
      const body = request.postDataJSON() as {
        titulo: string
        descripcion: string
      }
      estado.pedidos.push({ body, token: request.headers().authorization })
      if (respuesta === 'red') return route.abort('failed')
      if (respuesta === 'validacion')
        return route.fulfill({
          status: 400,
          headers,
          json: {
            codigo: 'VALIDACION',
            mensaje: 'El pedido tiene datos invalidos',
            detalles: [
              {
                campo: 'titulo',
                mensaje: 'debe tener entre 5 y 120 caracteres',
              },
            ],
            timestamp: '2026-11-14T14:00:00Z',
            path: '/api/tickets',
            correlationId: 'correlacion-e2e',
          },
        })
      const base = crearTicket(1, {
        titulo: body.titulo,
        descripcion: body.descripcion,
      })
      const ticket =
        respuesta === 'escalado'
          ? base
          : {
              ...base,
              estado: 'PENDIENTE_CLASIFICACION' as const,
              prioridad: null,
              fechaLimiteSla: null,
              motivoEscalamiento: null,
              clasificacion: null,
            }
      return route.fulfill({ status: 201, headers, json: ticket })
    }
    return route.fulfill({
      status: 404,
      headers,
      json: { codigo: 'NO_ENCONTRADO', mensaje: 'Ruta sin fixture.' },
    })
  })
  return estado
}

async function completar(page: Page, titulo: string, descripcion: string) {
  await page.getByLabel('Título').fill(titulo)
  await page.getByLabel('Descripción').fill(descripcion)
  await page.getByRole('button', { name: 'Crear ticket' }).click()
}

test('un solicitante crea un ticket crítico y ve la prioridad, el plazo y la derivación', async ({
  page,
}) => {
  const estado = await mockCrear(page, 'escalado')
  await abrir(page, '/tickets/nuevo', 'SOLICITANTE')
  await completar(
    page,
    '  No puede ingresar nadie  ',
    'Producción caída, todos los usuarios bloqueados en el login desde las 9',
  )

  await expect(
    page.getByRole('heading', { name: 'No puede ingresar nadie' }),
  ).toBeFocused()
  await expect(page.getByText('Escalado', { exact: true })).toBeVisible()
  await expect(page.getByText('P1 · Crítica')).toBeVisible()
  await expect(
    page.getByText('Plazo de resolución', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Prioridad P1')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Ver mis tickets' }),
  ).toHaveAttribute('href', '/mis-tickets')
  expect(estado.pedidos).toHaveLength(1)
  expect(estado.pedidos[0]?.body).toEqual({
    titulo: 'No puede ingresar nadie',
    descripcion:
      'Producción caída, todos los usuarios bloqueados en el login desde las 9',
  })
  expect(estado.pedidos[0]?.token).toBe('Bearer token-ficticio-e2e')
})

test('si la IA todavía no clasificó, avisa que la prioridad llega después', async ({
  page,
}) => {
  await mockCrear(page, 'pendiente')
  await abrir(page, '/tickets/nuevo', 'SOLICITANTE')
  await completar(
    page,
    'Consulta de facturación',
    'No encuentro la factura de octubre',
  )

  await expect(page.getByText('Pendiente de clasificación')).toBeVisible()
  await expect(page.getByText('Sin prioridad')).toBeVisible()
  await expect(page.getByRole('status')).toContainText(
    'Estamos analizando tu ticket',
  )
  await expect(
    page.getByText('Plazo de resolución', { exact: true }),
  ).toHaveCount(0)
})

test('valida los largos del contrato antes de enviar', async ({ page }) => {
  const estado = await mockCrear(page, 'escalado')
  await abrir(page, '/tickets/nuevo', 'SOLICITANTE')
  await completar(page, 'Hola', '   ')

  await expect(page.getByText('Escribí al menos 5 caracteres.')).toBeVisible()
  await expect(page.getByText('Completá este campo.')).toBeVisible()
  await expect(page.getByLabel('Título')).toHaveAttribute(
    'aria-invalid',
    'true',
  )
  expect(estado.pedidos).toHaveLength(0)
})

test('un 400 del backend se muestra en el campo y conserva lo escrito', async ({
  page,
}) => {
  await mockCrear(page, 'validacion')
  await abrir(page, '/tickets/nuevo', 'SOLICITANTE')
  await completar(
    page,
    'Título válido',
    'Una descripción suficientemente larga',
  )

  await expect(page.getByRole('alert')).toHaveText(
    'El pedido tiene datos invalidos',
  )
  await expect(
    page.getByText('debe tener entre 5 y 120 caracteres'),
  ).toBeVisible()
  await expect(page.getByLabel('Título')).toHaveValue('Título válido')
})

test('sin conexión no reintenta solo y advierte revisar antes de reenviar', async ({
  page,
}) => {
  const estado = await mockCrear(page, 'red')
  await abrir(page, '/tickets/nuevo', 'SOLICITANTE')
  await completar(
    page,
    'Título válido',
    'Una descripción suficientemente larga',
  )

  await expect(page.getByRole('alert')).toContainText(
    'Puede que el ticket se haya creado igual',
  )
  await expect(page.getByRole('button', { name: 'Crear ticket' })).toBeEnabled()
  await expect(page.getByLabel('Descripción')).toHaveValue(
    'Una descripción suficientemente larga',
  )
  expect(estado.pedidos).toHaveLength(1)
})

test('un agente va al detalle del ticket creado y puede crear otro', async ({
  page,
}) => {
  await mockCrear(page, 'escalado')
  await abrir(page, '/tickets/nuevo', 'AGENTE')
  await completar(
    page,
    'Caída del portal',
    'El portal de clientes no carga desde las 10',
  )

  await expect(
    page.getByRole('link', { name: 'Ver el detalle' }),
  ).toHaveAttribute('href', '/tickets/' + id(1))
  await page.getByRole('button', { name: 'Crear otro ticket' }).click()
  await expect(page.getByLabel('Título')).toHaveValue('')
  await expect(page.getByLabel('Descripción')).toHaveValue('')
})
