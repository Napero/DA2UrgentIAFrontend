import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { ApiClient } from './client.ts'
import { ApiError } from './errors.ts'

const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

test('envía JSON, token actual, filtros y correlationId al gateway', async () => {
  let token = 'primer-token'
  let ultimaRequest: Request | undefined
  globalThis.fetch = async (input, init) => {
    ultimaRequest = new Request(input, init)
    return Response.json({ ok: true })
  }
  const client = new ApiClient('http://localhost:8080/', {
    getAccessToken: () => token,
  })
  const data = await client.request<{ ok: boolean }>('/api/prueba', {
    method: 'POST',
    body: { ejemplo: true },
    query: { page: 0, activo: false, vacio: undefined },
  })
  assert.equal(data.ok, true)
  assert.equal(
    ultimaRequest?.url,
    'http://localhost:8080/api/prueba?page=0&activo=false',
  )
  assert.equal(
    ultimaRequest?.headers.get('Authorization'),
    'Bearer primer-token',
  )
  assert.equal(ultimaRequest?.headers.get('Content-Type'), 'application/json')
  assert.match(
    ultimaRequest?.headers.get('X-Correlation-Id') ?? '',
    /^[0-9a-f-]{36}$/,
  )
  assert.deepEqual(await ultimaRequest?.json(), { ejemplo: true })
  token = 'token-renovado'
  await client.request('/api/prueba', {
    headers: { 'X-Correlation-Id': 'correlacion-existente' },
  })
  assert.equal(
    ultimaRequest?.headers.get('Authorization'),
    'Bearer token-renovado',
  )
  assert.equal(
    ultimaRequest?.headers.get('X-Correlation-Id'),
    'correlacion-existente',
  )
})

test('conserva código, mensaje, validaciones y correlación del error común', async () => {
  globalThis.fetch = async () =>
    Response.json(
      {
        codigo: 'VALIDACION',
        mensaje: 'Revisá los campos.',
        detalles: [
          { campo: 'titulo', mensaje: 'Es obligatorio.' },
          { invalido: true },
        ],
        correlationId: 'desde-el-body',
      },
      { status: 400 },
    )
  await assert.rejects(
    new ApiClient('http://localhost:8080').request('/api/prueba'),
    (error: unknown) => {
      assert.ok(error instanceof ApiError)
      assert.equal(error.status, 400)
      assert.equal(error.codigo, 'VALIDACION')
      assert.equal(error.message, 'Revisá los campos.')
      assert.equal(error.correlationId, 'desde-el-body')
      assert.deepEqual(error.detalles, [
        { campo: 'titulo', mensaje: 'Es obligatorio.' },
      ])
      return true
    },
  )
})

test('avisa a la sesión ante 401 aunque la respuesta no sea JSON', async () => {
  let avisos = 0
  globalThis.fetch = async () => new Response('No autorizado', { status: 401 })
  const client = new ApiClient('http://localhost:8080', {
    onUnauthorized: () => {
      avisos++
    },
  })
  await assert.rejects(
    client.request('/api/prueba'),
    (error: unknown) => error instanceof ApiError && error.status === 401,
  )
  assert.equal(avisos, 1)
})

test('un 403 no dispara el cierre de sesión y un error HTML conserva el status', async () => {
  let avisos = 0
  globalThis.fetch = async () =>
    new Response('<h1>Prohibido</h1>', {
      status: 403,
      headers: { 'X-Correlation-Id': 'desde-header' },
    })
  const client = new ApiClient('http://localhost:8080', {
    onUnauthorized: () => {
      avisos++
    },
  })
  await assert.rejects(
    client.request('/api/prueba'),
    (error: unknown) =>
      error instanceof ApiError &&
      error.status === 403 &&
      error.correlationId === 'desde-header',
  )
  assert.equal(avisos, 0)
})

test('admite respuestas sin contenido y detecta JSON inválido en un éxito', async () => {
  const client = new ApiClient('http://localhost:8080')
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await client.request('/api/prueba'), undefined)
  globalThis.fetch = async () => new Response('esto no es JSON')
  await assert.rejects(
    client.request('/api/prueba'),
    (error: unknown) => error instanceof ApiError && error.tipo === 'respuesta',
  )
})

test('distingue errores de red sin reintentar una escritura', async () => {
  let llamados = 0
  globalThis.fetch = async () => {
    llamados++
    throw new TypeError('Failed to fetch')
  }
  await assert.rejects(
    new ApiClient('http://localhost:8080').request('/api/prueba', {
      method: 'POST',
    }),
    (error: unknown) => error instanceof ApiError && error.tipo === 'red',
  )
  assert.equal(llamados, 1)
})

test('distingue timeout de una cancelación explícita', async () => {
  globalThis.fetch = (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener(
        'abort',
        () => reject(init.signal?.reason),
        { once: true },
      )
    })
  // Mantiene vivo el event loop mientras AbortSignal.timeout usa un timer unref.
  const mantenerVivo = setInterval(() => {}, 50)
  try {
    await assert.rejects(
      new ApiClient('http://localhost:8080', { timeoutMs: 10 }).request(
        '/api/prueba',
      ),
      (error: unknown) => error instanceof ApiError && error.tipo === 'timeout',
    )
    const controller = new AbortController()
    const request = new ApiClient('http://localhost:8080').request(
      '/api/prueba',
      { signal: controller.signal },
    )
    controller.abort()
    await assert.rejects(
      request,
      (error: unknown) =>
        error instanceof DOMException && error.name === 'AbortError',
    )
  } finally {
    clearInterval(mantenerVivo)
  }
})

test('rechaza URLs externas en rutas y configuración inválida', async () => {
  const client = new ApiClient('http://localhost:8080')
  for (const ruta of [
    'https://otro.local/api',
    '//otro.local/api',
    '/\\otro.local',
  ]) {
    await assert.rejects(client.request(ruta), /pertenecer al gateway/)
  }
  assert.throws(() => new ApiClient('file:///tmp/algo'), /HTTP/)
  assert.throws(
    () => new ApiClient('https://usuario:clave@ejemplo.local'),
    /credenciales/,
  )
  assert.throws(
    () => new ApiClient('http://localhost:8080', { timeoutMs: 0 }),
    /timeout/,
  )
})
