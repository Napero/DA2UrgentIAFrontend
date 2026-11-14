import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  estadosDisponibles,
  puedeAsignar,
  puedeReclasificar,
  slaVencido,
} from './model.ts'

test('las transiciones de la UI respetan el estado y la asignación', () => {
  assert.deepEqual(
    estadosDisponibles({ estado: 'EN_CURSO', agenteAsignadoId: 'agente' }),
    ['RESUELTO', 'ESCALADO'],
  )
  assert.deepEqual(
    estadosDisponibles({ estado: 'ESCALADO', agenteAsignadoId: null }),
    [],
  )
  assert.deepEqual(
    estadosDisponibles({ estado: 'ESCALADO', agenteAsignadoId: 'agente' }),
    ['EN_CURSO'],
  )
  assert.deepEqual(
    estadosDisponibles({ estado: 'RESUELTO', agenteAsignadoId: 'agente' }),
    ['EN_CURSO', 'CERRADO'],
  )
  assert.deepEqual(
    estadosDisponibles({ estado: 'CERRADO', agenteAsignadoId: 'agente' }),
    [],
  )
  assert.deepEqual(
    estadosDisponibles({ estado: 'CLASIFICADO', agenteAsignadoId: null }),
    [],
  )
})

test('asignación y reclasificación solo se ofrecen en sus estados permitidos', () => {
  for (const estado of [
    'NUEVO',
    'PENDIENTE_CLASIFICACION',
    'CLASIFICADO',
    'ASIGNADO',
    'EN_CURSO',
    'ESCALADO',
    'RESUELTO',
    'CERRADO',
  ] as const) {
    assert.equal(
      puedeAsignar({ estado }),
      ['CLASIFICADO', 'ESCALADO'].includes(estado),
    )
    assert.equal(
      puedeReclasificar({ estado }),
      ['PENDIENTE_CLASIFICACION', 'CLASIFICADO'].includes(estado),
    )
  }
})

test('SLA respeta el límite estricto, los nulos y los estados finalizados', () => {
  const ahora = Date.parse('2026-11-14T15:00:00Z')
  assert.equal(
    slaVencido(
      { estado: 'EN_CURSO', fechaLimiteSla: '2026-11-14T14:59:59Z' },
      ahora,
    ),
    true,
  )
  assert.equal(
    slaVencido(
      { estado: 'EN_CURSO', fechaLimiteSla: '2026-11-14T15:00:00Z' },
      ahora,
    ),
    false,
  )
  assert.equal(
    slaVencido(
      { estado: 'RESUELTO', fechaLimiteSla: '2026-11-14T14:00:00Z' },
      ahora,
    ),
    false,
  )
  assert.equal(
    slaVencido(
      { estado: 'CERRADO', fechaLimiteSla: '2026-11-14T14:00:00Z' },
      ahora,
    ),
    false,
  )
  assert.equal(
    slaVencido(
      { estado: 'PENDIENTE_CLASIFICACION', fechaLimiteSla: null },
      ahora,
    ),
    false,
  )
})
