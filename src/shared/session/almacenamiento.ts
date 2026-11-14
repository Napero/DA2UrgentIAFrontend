import type { Rol, Sesion } from '../api/types'

// Política de sesión de P3: se guarda en localStorage, compartida entre pestañas, y nunca se
// usa un token vencido. El token no se decodifica: alcanza con expiresIn del login.

export const CLAVE_SESION = 'urgentia.sesion'

/** Margen para no seguir con un token que vence en segundos y fallaría en la próxima consulta. */
export const MARGEN_VENCIMIENTO_MS = 30_000

const ROLES: readonly Rol[] = ['SOLICITANTE', 'AGENTE', 'ADMIN']

export interface SesionGuardada extends Sesion {
  /** Momento (epoch en ms) en que vence el token. */
  expiraEn: number
}

/** Lo mínimo del LoginResponse que hace falta para armar la sesión. */
export interface RespuestaLogin extends Sesion {
  expiresIn: number
}

export type Almacen = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function crearSesionGuardada(
  respuesta: RespuestaLogin,
  ahora: number,
): SesionGuardada {
  return {
    accessToken: respuesta.accessToken,
    usuario: {
      id: respuesta.usuario.id,
      nombre: respuesta.usuario.nombre,
      email: respuesta.usuario.email,
      rol: respuesta.usuario.rol,
    },
    expiraEn: ahora + respuesta.expiresIn * 1000,
  }
}

export function vigente(sesion: SesionGuardada, ahora: number) {
  return sesion.expiraEn - MARGEN_VENCIMIENTO_MS > ahora
}

/** Devuelve la sesión guardada si es válida y sigue vigente; si no, la borra. */
export function leerSesion(
  almacen: Almacen | null,
  ahora: number,
): SesionGuardada | null {
  if (!almacen) return null
  let texto: string | null
  try {
    texto = almacen.getItem(CLAVE_SESION)
  } catch {
    return null
  }
  if (!texto) return null
  try {
    const valor: unknown = JSON.parse(texto)
    if (esSesionGuardada(valor) && vigente(valor, ahora)) return valor
  } catch {
    // JSON roto: se trata igual que una sesión inválida.
  }
  borrarSesion(almacen)
  return null
}

export function guardarSesion(almacen: Almacen | null, sesion: SesionGuardada) {
  try {
    almacen?.setItem(CLAVE_SESION, JSON.stringify(sesion))
  } catch {
    // Sin almacenamiento (modo privado o cuota llena) la sesión dura hasta recargar.
  }
}

export function borrarSesion(almacen: Almacen | null) {
  try {
    almacen?.removeItem(CLAVE_SESION)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}

/** Pantalla a la que va cada rol después de iniciar sesión, si no pidió otra. */
export function destinoInicial(rol: Rol) {
  return rol === 'SOLICITANTE' ? '/mis-tickets' : '/tickets'
}

/** Solo acepta rutas internas de la aplicación, para no redirigir a otro sitio. */
export function rutaDeRetornoSegura(valor: unknown): string | null {
  if (
    typeof valor !== 'string' ||
    !valor.startsWith('/') ||
    valor.startsWith('//') ||
    valor.includes('\\') ||
    valor === '/login' ||
    valor.startsWith('/login?') ||
    valor.startsWith('/login/')
  )
    return null
  return valor
}

function esSesionGuardada(valor: unknown): valor is SesionGuardada {
  if (typeof valor !== 'object' || valor === null) return false
  const sesion = valor as Record<string, unknown>
  const usuario = sesion.usuario as Record<string, unknown> | null | undefined
  return (
    typeof sesion.accessToken === 'string' &&
    sesion.accessToken.length > 0 &&
    typeof sesion.expiraEn === 'number' &&
    Number.isFinite(sesion.expiraEn) &&
    typeof usuario === 'object' &&
    usuario !== null &&
    typeof usuario.id === 'string' &&
    typeof usuario.nombre === 'string' &&
    typeof usuario.email === 'string' &&
    ROLES.includes(usuario.rol as Rol)
  )
}
