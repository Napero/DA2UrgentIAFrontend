import { createContext, useContext } from 'react'
import type { Sesion } from '../api/types'
import type { crearServicios } from '../api/services'

export interface SesionContextValue {
  sesion: Sesion | null
  servicios: ReturnType<typeof crearServicios> | null
  errorConfiguracion: string | null
  onCerrarSesion?: () => void
}

export const SesionContext = createContext<SesionContextValue>({
  sesion: null,
  servicios: null,
  errorConfiguracion: null,
})

export function useSesion() {
  return useContext(SesionContext)
}

export function useServicios() {
  const { servicios } = useSesion()
  if (!servicios)
    throw new Error('Los servicios requieren una sesión y VITE_API_URL.')
  return servicios
}
