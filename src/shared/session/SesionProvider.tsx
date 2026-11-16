import { useMemo, type ReactNode } from 'react'
import { createApiClient } from '../api'
import { crearServicios } from '../api/services'
import type { Sesion } from '../api/types'
import { SesionContext, type SesionContextValue } from './context'

export interface SesionProviderProps {
  sesion?: Sesion | null
  onCerrarSesion?: () => void
  onUnauthorized?: () => void
  children: ReactNode
}

export function SesionProvider({
  sesion = null,
  onCerrarSesion,
  onUnauthorized,
  children,
}: SesionProviderProps) {
  const value = useMemo<SesionContextValue>(() => {
    try {
      return {
        sesion,
        onCerrarSesion,
        errorConfiguracion: null,
        servicios: sesion
          ? crearServicios(
              createApiClient({
                getAccessToken: () => sesion.accessToken,
                onUnauthorized,
              }),
            )
          : null,
      }
    } catch (error) {
      return {
        sesion,
        servicios: null,
        onCerrarSesion,
        errorConfiguracion:
          error instanceof Error
            ? error.message
            : 'No se pudo configurar la conexión.',
      }
    }
  }, [sesion, onCerrarSesion, onUnauthorized])
  return <SesionContext value={value}>{children}</SesionContext>
}
