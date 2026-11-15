import { expect, test, type Page } from '@playwright/test'
import type { Usuario } from '../../src/shared/api/types'
import { abrir } from './fixtures'

// Alta y listado de usuarios (P3). Entra con el harness de P6 y simula el gateway.

const usuarios: Usuario[] = [
  {
    id: 'b1c2d3e4-0000-4000-8000-000000000001',
    nombre: 'Ada Admin',
    email: 'admin@urgentia.local',
    rol: 'ADMIN',
    activo: true,
    fechaAlta: '2026-10-01T12:00:00Z',
  },
  {
    id: 'b1c2d3e4-0000-4000-8000-000000000002',
    nombre: 'Guido Guardia',
    email: 'guardia@urgentia.local',
    rol: 'AGENTE',
    activo: true,
    fechaAlta: '2026-10-01T12:00:00Z',
  },
  {
    id: 'b1c2d3e4-0000-4000-8000-000000000004',
    nombre: 'Sofía Solicitante',
    email: 'solicitante@urgentia.local',
    rol: 'SOLICITANTE',
    activo: false,
    fechaAlta: '2026-10-01T12:00:00Z',
  },
]

type RespuestaAlta = 'ok' | 'duplicado' | 'validacion'

async function mockGateway(page: Page, alta: RespuestaAlta = 'ok') {
  const estado = {
    listados: [] as string[],
    altas: [] as unknown[],
    llamadas: 0,
  }
  await page.route('http://localhost:8080/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    estado.llamadas++
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:5175',
      'Access-Control-Expose-Headers': 'X-Correlation-Id',
      'X-Correlation-Id': 'correlacion-e2e',
    }
    const error = (
      status: number,
      codigo: string,
      mensaje: string,
      detalles?: unknown,
    ) =>
      route.fulfill({
        status,
        headers,
        json: {
          codigo,
          mensaje,
          ...(detalles ? { detalles } : {}),
          timestamp: '2026-11-14T14:00:00Z',
          path: url.pathname,
          correlationId: 'correlacion-e2e',
        },
      })
    if (url.pathname !== '/api/usuarios')
      return error(404, 'NO_ENCONTRADO', 'Ruta sin fixture.')
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as Omit<
        Usuario,
        'id' | 'activo' | 'fechaAlta'
      >
      estado.altas.push(body)
      if (alta === 'duplicado')
        return error(
          409,
          'EMAIL_DUPLICADO',
          'Ya existe un usuario con el email ' + body.email,
        )
      if (alta === 'validacion')
        return error(400, 'VALIDACION', 'El pedido tiene datos invalidos', [
          {
            campo: 'email',
            mensaje:
              'debe ser una dirección de correo electrónico con formato correcto',
          },
        ])
      const creado: Usuario = {
        id: '3f1c2a7e-9b4d-4e2a-8c1f-5d6e7f8a9b0c',
        nombre: body.nombre,
        email: body.email.toLowerCase(),
        rol: body.rol,
        activo: true,
        fechaAlta: '2026-11-14T14:00:00Z',
      }
      usuarios.push(creado)
      return route.fulfill({ status: 201, headers, json: creado })
    }
    estado.listados.push(url.search)
    const rol = url.searchParams.get('rol')
    const content = usuarios.filter((usuario) => !rol || usuario.rol === rol)
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
  })
  return estado
}

async function completarAlta(
  page: Page,
  datos: { nombre: string; email: string; password: string; rol?: string },
) {
  await page.getByLabel('Nombre').fill(datos.nombre)
  await page.getByLabel('Email').fill(datos.email)
  await page.getByLabel('Contraseña inicial').fill(datos.password)
  if (datos.rol)
    await page
      .getByRole('combobox', { name: 'Rol' })
      .first()
      .selectOption(datos.rol)
  await page.getByRole('button', { name: 'Dar de alta' }).click()
}

test.afterEach(() => {
  usuarios.splice(3)
})

test('lista los usuarios y filtra por rol en la URL', async ({ page }) => {
  const estado = await mockGateway(page)
  await abrir(page, '/usuarios', 'ADMIN')

  const tabla = page.getByRole('table')
  await expect(tabla.getByRole('cell', { name: 'Guido Guardia' })).toBeVisible()
  await expect(tabla.getByRole('cell', { name: 'Administrador' })).toBeVisible()
  await expect(tabla.getByRole('cell', { name: 'Inactivo' })).toBeVisible()

  await page
    .getByRole('group', { name: 'Filtros de usuarios' })
    .getByRole('combobox', { name: 'Rol' })
    .selectOption('AGENTE')
  await expect(page).toHaveURL(/rol=AGENTE/)
  await expect(tabla.getByRole('cell', { name: 'Ada Admin' })).toHaveCount(0)
  expect(estado.listados.some((query) => query.includes('rol=AGENTE'))).toBe(
    true,
  )
})

test('da de alta un usuario, avisa, limpia el formulario y actualiza el listado', async ({
  page,
}) => {
  const estado = await mockGateway(page)
  await abrir(page, '/usuarios', 'ADMIN')
  await expect(page.getByRole('cell', { name: 'Guido Guardia' })).toBeVisible()
  const listadosAntes = estado.listados.length

  await completarAlta(page, {
    nombre: '  Ana Agente  ',
    email: ' ana@urgentia.local ',
    password: 'Segura123!',
    rol: 'AGENTE',
  })

  await expect(
    page.getByRole('status').filter({ hasText: 'Se dio de alta' }),
  ).toHaveText('Se dio de alta a Ana Agente (ana@urgentia.local) como agente.')
  expect(estado.altas).toEqual([
    {
      nombre: 'Ana Agente',
      email: 'ana@urgentia.local',
      password: 'Segura123!',
      rol: 'AGENTE',
    },
  ])
  await expect(page.getByLabel('Nombre')).toHaveValue('')
  await expect(page.getByLabel('Contraseña inicial')).toHaveValue('')
  await expect(page.getByRole('cell', { name: 'Ana Agente' })).toBeVisible()
  expect(estado.listados.length).toBeGreaterThan(listadosAntes)
})

test('valida antes de enviar, incluido el rol', async ({ page }) => {
  const estado = await mockGateway(page)
  await abrir(page, '/usuarios', 'ADMIN')
  await completarAlta(page, { nombre: ' ', email: 'ana', password: '1234' })

  await expect(page.getByText('Completá el nombre.')).toBeVisible()
  await expect(page.getByText('Ingresá un email válido.')).toBeVisible()
  await expect(page.getByText('Usá al menos 8 caracteres.')).toBeVisible()
  await expect(page.getByText('Elegí un rol.')).toBeVisible()
  expect(estado.altas).toHaveLength(0)
})

test('un email repetido se marca en el campo y conserva lo escrito', async ({
  page,
}) => {
  await mockGateway(page, 'duplicado')
  await abrir(page, '/usuarios', 'ADMIN')
  await completarAlta(page, {
    nombre: 'Guido Bis',
    email: 'guardia@urgentia.local',
    password: 'Segura123!',
    rol: 'AGENTE',
  })

  await expect(
    page.getByText('Ya existe un usuario con ese email.'),
  ).toBeVisible()
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByLabel('Nombre')).toHaveValue('Guido Bis')
})

test('un 400 del backend se muestra en el campo que corresponde', async ({
  page,
}) => {
  await mockGateway(page, 'validacion')
  await abrir(page, '/usuarios', 'ADMIN')
  await completarAlta(page, {
    nombre: 'Ana Agente',
    email: 'ana@urgentia.local',
    password: 'Segura123!',
    rol: 'AGENTE',
  })

  await expect(page.getByRole('alert')).toHaveText(
    'El pedido tiene datos invalidos',
  )
  await expect(
    page.getByText(
      'debe ser una dirección de correo electrónico con formato correcto',
    ),
  ).toBeVisible()
})

test('un agente no accede a usuarios ni lo ve en el menú', async ({ page }) => {
  const estado = await mockGateway(page)
  await abrir(page, '/usuarios', 'AGENTE')

  await expect(
    page.getByRole('heading', { name: 'No tenés permiso para acceder' }),
  ).toBeVisible()
  await expect(
    page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Usuarios' }),
  ).toHaveCount(0)
  expect(estado.llamadas).toBe(0)
})
