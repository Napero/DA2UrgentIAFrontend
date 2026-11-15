import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Ticket } from '../../shared/api/types'
import { masReciente } from './seguimiento.ts'

function ticket(
  fechaActualizacion: string,
  cambios: Partial<Ticket> = {},
): Ticket {
  return {
    id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
    titulo: 'No puede ingresar nadie',
    descripcion: 'Producción caída',
    solicitanteId: 'b1c2d3e4-0000-4000-8000-000000000004',
    agenteAsignadoId: null,
    estado: 'PENDIENTE_CLASIFICACION',
    prioridad: null,
    fechaLimiteSla: null,
    requiereRevisionManual: false,
    motivoEscalamiento: null,
    clasificacion: null,
    fechaCreacion: '2026-11-14T14:00:00Z',
    fechaActualizacion,
    ...cambios,
  }
}

test('sin dato seguido usa el del listado', () => {
  const delListado = ticket('2026-11-14T14:00:00Z')
  assert.equal(masReciente(delListado, undefined), delListado)
})

test('prefiere el seguido cuando es más nuevo', () => {
  const seguido = ticket('2026-11-14T14:00:05Z', {
    estado: 'ESCALADO',
    prioridad: 'P1',
  })
  assert.equal(masReciente(ticket('2026-11-14T14:00:00Z'), seguido), seguido)
})

test('un listado recargado más nuevo no lo pisa el seguimiento viejo', () => {
  const delListado = ticket('2026-11-14T14:10:00Z', { estado: 'EN_CURSO' })
  const seguido = ticket('2026-11-14T14:00:05Z', { estado: 'ESCALADO' })
  assert.equal(masReciente(delListado, seguido), delListado)
})

test('una fecha que no se puede leer no rompe la elección', () => {
  const delListado = ticket('2026-11-14T14:00:00Z')
  assert.equal(masReciente(delListado, ticket('no es fecha')), delListado)
  const seguido = ticket('2026-11-14T14:00:05Z')
  assert.equal(masReciente(ticket('no es fecha'), seguido), seguido)
})
