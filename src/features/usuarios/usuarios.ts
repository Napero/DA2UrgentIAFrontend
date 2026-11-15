import type { Rol } from '../../shared/api/types'

export const roles: Record<Rol, string> = {
  SOLICITANTE: 'Solicitante',
  AGENTE: 'Agente',
  ADMIN: 'Administrador',
}

// Reglas de CrearUsuarioRequest en contracts/user-service.yaml y en user-service.
// El máximo de la contraseña no está en el contrato: es el límite de BCrypt (72 bytes),
// y una contraseña más larga el backend no la puede guardar.
export const LIMITES_USUARIO = {
  nombre: 120,
  email: 254,
  passwordMin: 8,
  passwordMax: 72,
} as const

export interface NuevoUsuario {
  nombre: string
  email: string
  password: string
  rol: Rol | ''
}

export type CampoUsuario = keyof NuevoUsuario
export type ErroresUsuario = Partial<Record<CampoUsuario, string>>

// Alcanza con descartar lo que claramente no es un email; el backend valida el formato final.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validarUsuario(usuario: NuevoUsuario): ErroresUsuario {
  const errores: ErroresUsuario = {}
  const nombre = usuario.nombre.trim()
  const email = usuario.email.trim()
  if (!nombre) errores.nombre = 'Completá el nombre.'
  else if (nombre.length > LIMITES_USUARIO.nombre)
    errores.nombre = `Usá como máximo ${LIMITES_USUARIO.nombre} caracteres.`
  if (!email) errores.email = 'Completá el email.'
  else if (email.length > LIMITES_USUARIO.email || !EMAIL.test(email))
    errores.email = 'Ingresá un email válido.'
  if (!usuario.password) errores.password = 'Completá la contraseña.'
  else if (usuario.password.length < LIMITES_USUARIO.passwordMin)
    errores.password = `Usá al menos ${LIMITES_USUARIO.passwordMin} caracteres.`
  else if (
    new TextEncoder().encode(usuario.password).length >
    LIMITES_USUARIO.passwordMax
  )
    errores.password = `Usá como máximo ${LIMITES_USUARIO.passwordMax} caracteres.`
  if (!usuario.rol) errores.rol = 'Elegí un rol.'
  return errores
}

export function esCampoUsuario(valor: string): valor is CampoUsuario {
  return ['nombre', 'email', 'password', 'rol'].includes(valor)
}
