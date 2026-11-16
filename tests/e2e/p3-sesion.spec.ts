import { expect, test, type Page } from '@playwright/test'

// Flujos de sesión de P3 sobre la aplicación real (main.tsx), con el gateway interceptado.
// No usan el harness de P6: acá la sesión sale del login, no de un token ficticio.

const CLAVE_SESION = 'urgentia.sesion'

const cuentas: Record<
  string,
  {
    password: string
    usuario: { id: string; nombre: string; email: string; rol: string }
  }
> = {
  'guardia@urgentia.local': {
    password: 'Agente123!',
    usuario: {
      id: 'b1c2d3e4-0000-4000-8000-000000000002',
      nombre: 'Gustavo Guardia',
      email: 'guardia@urgentia.local',
      rol: 'AGENTE',
    },
  },
  'solicitante@urgentia.local': {
    password: 'Usuario123!',
    usuario: {
      id: 'b1c2d3e4-0000-4000-8000-000000000004',
      nombre: 'Sofía Solicitante',
      email: 'solicitante@urgentia.local',
      rol: 'SOLICITANTE',
    },
  },
}

async function mockGateway(page: Page) {
  const estado = {
    llamadas: [] as {
      method: string
      path: string
      token: string | undefined
    }[],
    ticketsResponden401: false,
  }
  await page.route('http://localhost:8080/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    estado.llamadas.push({
      method: request.method(),
      path: url.pathname + url.search,
      token: request.headers().authorization,
    })
    const responder = (json: unknown, status = 200) =>
      route.fulfill({
        status,
        json,
        headers: {
          'Access-Control-Allow-Origin': 'http://localhost:5175',
          'Access-Control-Expose-Headers': 'X-Correlation-Id',
          'X-Correlation-Id': 'correlacion-e2e',
        },
      })
    const error = (codigo: string, mensaje: string, status: number) =>
      responder(
        {
          codigo,
          mensaje,
          timestamp: '2026-11-14T14:00:00Z',
          path: url.pathname,
          correlationId: 'correlacion-e2e',
        },
        status,
      )

    if (url.pathname === '/api/auth/login' && request.method() === 'POST') {
      const body = request.postDataJSON() as { email: string; password: string }
      const cuenta = cuentas[body.email]
      if (cuenta && cuenta.password === body.password)
        return responder({
          accessToken: 'token-' + cuenta.usuario.rol,
          tokenType: 'Bearer',
          expiresIn: 3600,
          usuario: cuenta.usuario,
        })
      return error(
        'CREDENCIALES_INVALIDAS',
        'Email o contraseña incorrectos',
        401,
      )
    }
    if (url.pathname === '/api/tickets') {
      if (estado.ticketsResponden401)
        return error('NO_AUTENTICADO', 'El token venció', 401)
      return responder({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      })
    }
    return error('NO_ENCONTRADO', 'Ruta sin fixture.', 404)
  })
  return estado
}

async function ingresar(page: Page, email: string, password: string) {
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Ingresar' }).click()
}

// Después del login, si no se había pedido otra pantalla, todos los roles van al inicio.
const INICIO = /localhost:\d+\/$/

const sesionGuardada = (page: Page) =>
  page.evaluate((clave) => window.localStorage.getItem(clave), CLAVE_SESION)

test('un agente inicia sesión, llega al inicio, la bandeja usa su token y la sesión sobrevive a una recarga', async ({
  page,
}) => {
  const estado = await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')

  await expect(page).toHaveURL(INICIO)
  await expect(
    page.getByRole('heading', { name: /Tu mesa de ayuda/ }),
  ).toBeVisible()
  await expect(page.getByText('Gustavo Guardia')).toBeVisible()
  const login = estado.llamadas.find(
    (llamada) => llamada.path === '/api/auth/login',
  )
  expect(login?.token).toBeUndefined()

  await page
    .getByRole('navigation', { name: 'Navegación principal' })
    .getByRole('link', { name: 'Bandeja de tickets' })
    .click()
  await expect(page).toHaveURL(/\/tickets$/)
  await expect
    .poll(() =>
      estado.llamadas.some(
        (llamada) =>
          llamada.path.startsWith('/api/tickets') &&
          llamada.token === 'Bearer token-AGENTE',
      ),
    )
    .toBe(true)

  await page.reload()
  await expect(page).toHaveURL(/\/tickets$/)
  await expect(page.getByText('Gustavo Guardia')).toBeVisible()
})

test('con credenciales incorrectas avisa en el formulario y no guarda nada', async ({
  page,
}) => {
  await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'guardia@urgentia.local', 'otra-clave')

  await expect(page.getByRole('alert')).toHaveText(
    'El email o la contraseña no son correctos.',
  )
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByLabel('Email')).toHaveValue('guardia@urgentia.local')
  expect(await sesionGuardada(page)).toBeNull()
})

test('un solicitante empieza en el inicio y el menú no le ofrece la bandeja', async ({
  page,
}) => {
  await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'solicitante@urgentia.local', 'Usuario123!')

  await expect(page).toHaveURL(INICIO)
  const menu = page.getByRole('navigation', { name: 'Navegación principal' })
  await expect(menu.getByRole('link', { name: 'Mis tickets' })).toBeVisible()
  await expect(
    menu.getByRole('link', { name: 'Bandeja de tickets' }),
  ).toHaveCount(0)
})

test('después del login vuelve a la pantalla que se había pedido', async ({
  page,
}) => {
  await mockGateway(page)
  await page.goto('/tickets?prioridad=P1')
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Iniciar sesión' })
    .click()
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')

  await expect(page).toHaveURL(/\/tickets\?prioridad=P1$/)
})

test('cerrar sesión borra la sesión y vuelve al login', async ({ page }) => {
  await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')
  await expect(page).toHaveURL(INICIO)

  await page.getByRole('button', { name: 'Cerrar sesión' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole('heading', { name: 'Iniciar sesión' }),
  ).toBeVisible()
  expect(await sesionGuardada(page)).toBeNull()
  await page.goto('/tickets')
  await expect(
    page.getByRole('heading', { name: 'Iniciá sesión para continuar' }),
  ).toBeVisible()
})

test('un 401 durante el uso cierra la sesión, avisa y permite retomar', async ({
  page,
}) => {
  const estado = await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')
  await expect(page).toHaveURL(INICIO)
  await page.goto('/tickets')

  // Antes de cambiar el mock, la bandeja tiene que haber hecho su primera consulta:
  // si no, esa consulta se llevaría el 401 desde la página anterior.
  await expect
    .poll(() =>
      estado.llamadas.some((llamada) =>
        llamada.path.startsWith('/api/tickets'),
      ),
    )
    .toBe(true)
  estado.ticketsResponden401 = true
  await page.goto('/tickets?estado=ESCALADO', { waitUntil: 'commit' })

  await expect(page).toHaveURL(/\/login\?motivo=vencida/)
  await expect(page.getByRole('status')).toContainText('Tu sesión venció')
  expect(await sesionGuardada(page)).toBeNull()

  estado.ticketsResponden401 = false
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')
  await expect(page).toHaveURL(/\/tickets\?estado=ESCALADO$/)
})

test('una sesión guardada que ya venció no se usa', async ({ page }) => {
  const estado = await mockGateway(page)
  await page.addInitScript((clave) => {
    if (window.location.pathname !== '/tickets') return
    window.localStorage.setItem(
      clave,
      JSON.stringify({
        accessToken: 'token-viejo',
        expiraEn: Date.now() - 1000,
        usuario: {
          id: 'b1c2d3e4-0000-4000-8000-000000000002',
          nombre: 'Gustavo Guardia',
          email: 'guardia@urgentia.local',
          rol: 'AGENTE',
        },
      }),
    )
  }, CLAVE_SESION)
  await page.goto('/tickets')

  await expect(
    page.getByRole('heading', { name: 'Iniciá sesión para continuar' }),
  ).toBeVisible()
  expect(estado.llamadas).toHaveLength(0)
  expect(await sesionGuardada(page)).toBeNull()
})

test('la sesión se comparte entre pestañas y cerrar sesión en una cierra las demás', async ({
  page,
}) => {
  await mockGateway(page)
  await page.goto('/login')
  await ingresar(page, 'guardia@urgentia.local', 'Agente123!')
  await expect(page).toHaveURL(INICIO)

  const otraPestana = await page.context().newPage()
  await mockGateway(otraPestana)
  await otraPestana.goto('/tickets')
  await expect(otraPestana.getByText('Gustavo Guardia')).toBeVisible()

  await otraPestana.getByRole('button', { name: 'Cerrar sesión' }).click()

  await expect(otraPestana).toHaveURL(/\/login$/)
  await expect(page).toHaveURL(/\/login$/)
  expect(await sesionGuardada(page)).toBeNull()
})

test('si otra pestaña inicia sesión, la que estaba en el login la toma', async ({
  page,
}) => {
  await mockGateway(page)
  await page.goto('/login')

  const otraPestana = await page.context().newPage()
  await mockGateway(otraPestana)
  await otraPestana.goto('/login')
  await ingresar(otraPestana, 'guardia@urgentia.local', 'Agente123!')
  await expect(otraPestana).toHaveURL(INICIO)

  await expect(page).toHaveURL(INICIO)
  await expect(page.getByText('Gustavo Guardia')).toBeVisible()
})
