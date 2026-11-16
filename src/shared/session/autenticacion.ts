import { createContext, useContext } from 'react'
import type { LoginRequest } from '../api/autenticacion'
import type { SesionGuardada } from './almacenamiento'

export interface AutenticacionValue {
  sesion: SesionGuardada | null
  /** Pide el token al gateway, guarda la sesión y la devuelve. Lanza ApiError si falla. */
  iniciarSesion: (credenciales: LoginRequest) => Promise<SesionGuardada>
  /** Cierre voluntario: borra la sesión y vuelve al login. */
  cerrarSesion: () => void
  /** Token vencido o rechazado (401): borra la sesión y vuelve al login para retomar. */
  sesionVencida: () => void
}

export const AutenticacionContext = createContext<AutenticacionValue | null>(
  null,
)

/** null fuera de AutenticacionProvider (por ejemplo, en el harness de pruebas de P6). */
export function useAutenticacion() {
  return useContext(AutenticacionContext)
}
