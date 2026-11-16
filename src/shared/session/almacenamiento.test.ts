import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CLAVE_SESION,
  MARGEN_VENCIMIENTO_MS,
  borrarSesion,
  crearSesionGuardada,
  guardarSesion,
  leerSesion,
  rutaDeRetornoSegura,
  type Almacen,
} from './almacenamiento.ts'

const AHORA = Date.UTC(2026, 10, 14, 12, 0, 0)

function almacenEnMemoria(inicial: Record<string, string> = {}) {
  const datos = new Map(Object.entries(inicial))
  const almacen: Almacen = {
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => void datos.set(clave, valor),
    removeItem: (clave) => void datos.delete(clave),
  }
  return { almacen, datos }
}

const respuesta = {
  accessToken: 'token-de-prueba',
  tokenType: 'Bearer',
  expiresIn: 3600,
  usuario: {
    id: 'b1c2d3e4-0000-4000-8000-000000000004',
    nombre: 'Sofía Solicitante',
    email: 'solicitante@urgentia.local',
    rol: 'SOLICITANTE' as const,
  },
}

test('arma la sesión con el vencimiento del token y sin campos extra', () => {
  const sesion = crearSesionGuardada(respuesta, AHORA)
  assert.equal(sesion.expiraEn, AHORA + 3_600_000)
  assert.deepEqual(Object.keys(sesion).sort(), [
    'accessToken',
    'expiraEn',
    'usuario',
  ])
})

test('guarda y recupera una sesión vigente', () => {
  const { almacen } = almacenEnMemoria()
  guardarSesion(almacen, crearSesionGuardada(respuesta, AHORA))
  const leida = leerSesion(almacen, AHORA + 60_000)
  assert.equal(leida?.accessToken, 'token-de-prueba')
  assert.equal(leida?.usuario.rol, 'SOLICITANTE')
})

test('descarta y borra una sesión vencida o a punto de vencer', () => {
  const { almacen, datos } = almacenEnMemoria()
  const sesion = crearSesionGuardada(respuesta, AHORA)
  guardarSesion(almacen, sesion)
  assert.equal(
    leerSesion(almacen, sesion.expiraEn - MARGEN_VENCIMIENTO_MS + 1),
    null,
  )
  assert.equal(datos.has(CLAVE_SESION), false)
})

test('descarta y borra lo que no es una sesión válida', () => {
  for (const invalido of [
    'no es json',
    '{}',
    JSON.stringify({
      ...crearSesionGuardada(respuesta, AHORA),
      accessToken: '',
    }),
    JSON.stringify({
      ...crearSesionGuardada(respuesta, AHORA),
      usuario: { ...respuesta.usuario, rol: 'SUPERUSUARIO' },
    }),
  ]) {
    const { almacen, datos } = almacenEnMemoria({ [CLAVE_SESION]: invalido })
    assert.equal(leerSesion(almacen, AHORA), null, invalido)
    assert.equal(datos.has(CLAVE_SESION), false, invalido)
  }
})

test('sin almacenamiento disponible no falla', () => {
  const roto: Almacen = {
    getItem: () => {
      throw new Error('bloqueado')
    },
    setItem: () => {
      throw new Error('bloqueado')
    },
    removeItem: () => {
      throw new Error('bloqueado')
    },
  }
  assert.equal(leerSesion(roto, AHORA), null)
  assert.equal(leerSesion(null, AHORA), null)
  guardarSesion(roto, crearSesionGuardada(respuesta, AHORA))
  borrarSesion(roto)
})

test('solo vuelve a rutas internas que no sean el login', () => {
  assert.equal(
    rutaDeRetornoSegura('/tickets?prioridad=P1'),
    '/tickets?prioridad=P1',
  )
  for (const peligrosa of [
    'https://otro.sitio',
    '//otro.sitio',
    '/\\otro.sitio',
    '/login',
    '/login?motivo=vencida',
    '',
    null,
    42,
  ])
    assert.equal(rutaDeRetornoSegura(peligrosa), null, String(peligrosa))
})
