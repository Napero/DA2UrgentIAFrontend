import { expect, test } from '@playwright/test'
import { abrir, mockApi, id, agenteId } from './fixtures'

test('sin sesión y con rol insuficiente no consulta datos protegidos', async ({
  page,
}) => {
  const state = await mockApi(page)
  await abrir(page, '/tickets', '')
  await expect(
    page.getByRole('heading', { name: 'Iniciá sesión para continuar' }),
  ).toBeVisible()
  await abrir(page, '/reportes', 'SOLICITANTE')
  await expect(
    page.getByRole('heading', { name: 'No tenés permiso para acceder' }),
  ).toBeVisible()
  expect(state.llamadas).toHaveLength(0)
})

test('bandeja filtra, pagina y conserva los filtros en la URL', async ({
  page,
}) => {
  const state = await mockApi(page)
  await abrir(page, '/tickets')
  await expect(
    page.getByRole('link', { name: 'Producción caída en login' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Siguiente', exact: true }).click()
  await expect(page).toHaveURL(/page=1/)
  await expect(
    page.getByRole('link', { name: 'Solicitud de soporte #21', exact: true }),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Prioridad', exact: true })
    .selectOption('P1')
  await expect(page).not.toHaveURL(/page=1/)
  await expect(
    page.getByRole('link', { name: 'Producción caída en login' }),
  ).toBeVisible()
  await page
    .getByRole('combobox', { name: 'Categoría', exact: true })
    .selectOption('BUG')
  await expect(
    page.getByRole('heading', { name: 'No hay tickets para estos filtros' }),
  ).toBeVisible()
  expect(
    state.llamadas.some(
      (call) =>
        call.path.includes('prioridad=P1') &&
        call.path.includes('categoria=BUG'),
    ),
  ).toBe(true)
  expect(
    state.llamadas.every((call) => call.token === 'Bearer token-ficticio-e2e'),
  ).toBe(true)
})

test('asigna agentes activos incluso si vienen en más de una página', async ({
  page,
}) => {
  const state = await mockApi(page)
  await abrir(page, '/tickets/' + id(1))
  const select = page.getByRole('combobox', { name: 'Agente', exact: true })
  await expect(select.locator('option')).toHaveCount(3)
  await expect(
    select.locator('option', { hasText: 'Agente inactivo' }),
  ).toHaveCount(0)
  await select.selectOption(agenteId)
  await page.getByRole('button', { name: 'Asignar', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Asignación actualizada.' }),
  ).toBeVisible()
  await expect(
    page.locator('.detail-badges').getByText('Asignado', { exact: true }),
  ).toBeVisible()
  expect(state.llamadas.filter((call) => call.method === 'PATCH')).toEqual([
    expect.objectContaining({
      path: '/api/tickets/' + id(1) + '/asignacion',
      body: { agenteId },
    }),
  ])
})

test('escalar exige motivo y un 409 conserva el error y permite reintentar', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.tickets[0]!.estado = 'EN_CURSO'
  state.tickets[0]!.agenteAsignadoId = agenteId
  await abrir(page, '/tickets/' + id(1))
  await page.getByLabel('Nuevo estado').selectOption('ESCALADO')
  await expect(
    page.getByRole('button', { name: 'Guardar estado' }),
  ).toBeDisabled()
  await page
    .getByLabel('Motivo del escalamiento')
    .fill('Riesgo de pérdida de datos')
  state.error = {
    path: '/api/tickets/' + id(1) + '/estado',
    method: 'PATCH',
    status: 409,
    mensaje: 'El ticket fue modificado. Actualizá la vista.',
  }
  await page.getByRole('button', { name: 'Guardar estado' }).click()
  await expect(page.getByRole('alert')).toContainText(
    'El ticket fue modificado.',
  )
  state.error = null
  await page.getByRole('button', { name: 'Guardar estado' }).click()
  await expect(
    page.locator('.detail-badges').getByText('Escalado', { exact: true }),
  ).toBeVisible()
  expect(state.llamadas.find((call) => call.method === 'PATCH')?.body).toEqual({
    estado: 'ESCALADO',
    motivo: 'Riesgo de pérdida de datos',
  })
})

test('reclasificación maneja IA caída y luego actualiza el detalle', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.error = {
    path: '/api/tickets/' + id(1) + '/reclasificacion',
    status: 503,
    mensaje: 'IA no disponible. Intentá nuevamente.',
  }
  await abrir(page, '/tickets/' + id(1))
  await page.getByRole('button', { name: 'Reclasificar', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('IA no disponible.')
  state.error = null
  await page.getByRole('button', { name: 'Reclasificar', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Clasificación actualizada.' }),
  ).toBeVisible()
})

test('un ticket pendiente se actualiza solo y uno cerrado no ofrece acciones', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.pendientes = 1
  await abrir(page, '/tickets/' + id(1))
  await expect(page.locator('.detail-badges')).toContainText(
    'Pendiente de clasificación',
  )
  await expect(page.locator('.detail-badges')).toContainText('Clasificado', {
    timeout: 9000,
  })
  state.tickets[0]!.estado = 'CERRADO'
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click()
  await expect(
    page.getByText('El ticket está cerrado y no admite más cambios.'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Reclasificar', exact: true }),
  ).toHaveCount(0)
})

test('reportes muestran resumen real, SLA nulo y listado filtrado', async ({
  page,
}) => {
  const state = await mockApi(page)
  await abrir(page, '/reportes')
  await expect(
    page.locator('.stat-card').filter({ hasText: 'Tickets totales' }),
  ).toContainText('42')
  await page.getByRole('button', { name: 'SLA', exact: true }).click()
  await expect(
    page.getByRole('cell', { name: '75%', exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole('cell', { name: 'Sin tickets resueltos' }),
  ).toBeVisible()
  await expect(page.getByRole('cell', { name: '4,2 h' })).toBeVisible()
  await page
    .getByRole('button', { name: 'Listado de tickets', exact: true })
    .click()
  await page
    .getByRole('combobox', { name: 'Prioridad', exact: true })
    .selectOption('P1')
  await expect(
    page.getByRole('link', { name: 'Producción caída en login' }),
  ).toBeVisible()
  expect(
    state.llamadas.some(
      (call) =>
        call.path.startsWith('/api/reportes/tickets?') &&
        call.path.includes('prioridad=P1'),
    ),
  ).toBe(true)
})

test('notificaciones filtran y muestran entregas fallidas sin inventar operaciones', async ({
  page,
}) => {
  const state = await mockApi(page)
  await abrir(page, '/notificaciones')
  await expect(
    page.getByRole('heading', { name: 'Ticket escalado a guardia' }),
  ).toBeVisible()
  await expect(page.getByText('Fallida', { exact: true })).toBeVisible()
  await page.getByLabel('Destinatario', { exact: true }).fill('GRUPO:GUARDIA')
  await page.getByRole('button', { name: 'Filtrar', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Tu ticket fue resuelto' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'Ticket escalado a guardia' }),
  ).toBeVisible()
  expect(state.llamadas.every((call) => call.method === 'GET')).toBe(true)
})

test('la sesión recibe el 401 y el 403 se muestra sin cerrar sesión', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.error = {
    path: '/api/tickets',
    status: 403,
    mensaje: 'Tu rol no puede consultar tickets.',
  }
  await abrir(page, '/tickets')
  await expect(page.getByRole('alert')).toContainText('No tenés permiso')
  await expect(page).not.toHaveURL(/login/)
  state.error = {
    path: '/api/tickets',
    status: 401,
    mensaje: 'El token venció.',
  }
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('recupera una consulta fallida y el menú móvil no desborda', async ({
  page,
}) => {
  const state = await mockApi(page)
  state.error = {
    path: '/api/tickets',
    status: 500,
    mensaje: 'Error de consulta temporal.',
  }
  await abrir(page, '/tickets')
  await expect(page.getByRole('alert')).toContainText(
    'Error de consulta temporal.',
  )
  state.error = null
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click()
  await expect(
    page.getByRole('link', { name: 'Producción caída en login' }),
  ).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Menú', exact: true }).click()
  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Reportes', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Reportes', exact: true }),
  ).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(overflow).toBe(false)
})
