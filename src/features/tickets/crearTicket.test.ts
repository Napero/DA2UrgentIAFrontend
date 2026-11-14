import assert from 'node:assert/strict'
import { test } from 'node:test'
import { LIMITES, validarTicket } from './crearTicket.ts'

const valido = {
  titulo: 'No puede ingresar nadie',
  descripcion: 'Producción caída, todos los usuarios bloqueados',
}

test('un ticket con los largos del contrato no tiene errores', () => {
  assert.deepEqual(validarTicket(valido), {})
  assert.deepEqual(
    validarTicket({
      titulo: 'x'.repeat(LIMITES.titulo.min),
      descripcion: 'y'.repeat(LIMITES.descripcion.max),
    }),
    {},
  )
})

test('pide completar los campos vacíos o con solo espacios', () => {
  assert.deepEqual(validarTicket({ titulo: '   ', descripcion: '' }), {
    titulo: 'Completá este campo.',
    descripcion: 'Completá este campo.',
  })
})

test('respeta los mínimos y máximos del contrato contando sin espacios de los bordes', () => {
  assert.equal(
    validarTicket({ ...valido, titulo: '  abcd  ' }).titulo,
    'Escribí al menos 5 caracteres.',
  )
  assert.equal(
    validarTicket({ ...valido, descripcion: 'corta' }).descripcion,
    'Escribí al menos 10 caracteres.',
  )
  assert.equal(
    validarTicket({ ...valido, titulo: 'x'.repeat(LIMITES.titulo.max + 1) })
      .titulo,
    'Usá como máximo 120 caracteres.',
  )
})
