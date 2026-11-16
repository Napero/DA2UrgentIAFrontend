import assert from 'node:assert/strict'
import { test } from 'node:test'
import { esCampoUsuario, validarUsuario } from './usuarios.ts'

const valido = {
  nombre: 'Ana Agente',
  email: 'ana@urgentia.local',
  password: 'Segura123!',
  rol: 'AGENTE' as const,
}

test('un usuario con los datos del contrato no tiene errores', () => {
  assert.deepEqual(validarUsuario(valido), {})
})

test('pide completar todo, incluido el rol', () => {
  assert.deepEqual(
    validarUsuario({ nombre: '  ', email: '', password: '', rol: '' }),
    {
      nombre: 'Completá el nombre.',
      email: 'Completá el email.',
      password: 'Completá la contraseña.',
      rol: 'Elegí un rol.',
    },
  )
})

test('respeta los largos del contrato y el límite de BCrypt', () => {
  assert.equal(
    validarUsuario({ ...valido, nombre: 'x'.repeat(121) }).nombre,
    'Usá como máximo 120 caracteres.',
  )
  assert.equal(
    validarUsuario({ ...valido, password: '1234567' }).password,
    'Usá al menos 8 caracteres.',
  )
  assert.equal(
    validarUsuario({ ...valido, password: 'x'.repeat(72) }).password,
    undefined,
  )
  assert.equal(
    validarUsuario({ ...valido, password: 'x'.repeat(73) }).password,
    'Usá como máximo 72 caracteres.',
  )
  // 37 caracteres con tilde ocupan 74 bytes: BCrypt cuenta bytes, no caracteres.
  assert.equal(
    validarUsuario({ ...valido, password: 'á'.repeat(37) }).password,
    'Usá como máximo 72 caracteres.',
  )
})

test('descarta lo que claramente no es un email', () => {
  for (const email of ['ana', 'ana@', '@urgentia.local', 'ana @urgentia.local'])
    assert.equal(
      validarUsuario({ ...valido, email }).email,
      'Ingresá un email válido.',
      email,
    )
})

test('reconoce los campos del formulario en los detalles del backend', () => {
  assert.equal(esCampoUsuario('email'), true)
  assert.equal(esCampoUsuario('activo'), false)
})
