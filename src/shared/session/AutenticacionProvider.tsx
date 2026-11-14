import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createApiClient } from '../api'
import { pedirLogin, type LoginRequest } from '../api/autenticacion'
import {
  CLAVE_SESION,
  MARGEN_VENCIMIENTO_MS,
  borrarSesion,
  crearSesionGuardada,
  guardarSesion,
  leerSesion,
  type SesionGuardada,
} from './almacenamiento'
import { AutenticacionContext, type AutenticacionValue } from './autenticacion'

// El timeout máximo de setTimeout es de unos 24 días; el token dura una hora.
const MAX_TIMEOUT_MS = 2_147_483_647

function almacen(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function irA(destino: string) {
  if (window.location.pathname !== '/login') window.location.assign(destino)
}

/**
 * Sesión de P3: login, persistencia en localStorage y cierre. Envuelve a App, que recibe
 * la sesión por props (contrato de P6 en docs/P6_FRONTEND.md).
 *
 * La sesión se comparte entre pestañas: si una cierra sesión o recibe un 401, las demás
 * vuelven al login; si una inicia sesión, las demás la toman.
 *
 * Al cerrar o vencer la sesión se recarga la aplicación en /login: así no queda en memoria
 * ninguna respuesta del usuario anterior.
 */
export function AutenticacionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionGuardada | null>(() =>
    leerSesion(almacen(), Date.now()),
  )

  const salir = useCallback((destino: string) => {
    borrarSesion(almacen())
    setSesion(null)
    irA(destino)
  }, [])

  const cerrarSesion = useCallback(() => salir('/login'), [salir])

  const sesionVencida = useCallback(() => {
    const volverA = window.location.pathname + window.location.search
    salir('/login?' + new URLSearchParams({ motivo: 'vencida', volverA }))
  }, [salir])

  const iniciarSesion = useCallback(async (credenciales: LoginRequest) => {
    const respuesta = await pedirLogin(createApiClient(), credenciales)
    const nueva = crearSesionGuardada(respuesta, Date.now())
    guardarSesion(almacen(), nueva)
    setSesion(nueva)
    return nueva
  }, [])

  // Cuando el token está por vencer, se cierra la sesión antes de que falle una consulta.
  useEffect(() => {
    if (!sesion) return
    const espera = Math.max(
      0,
      Math.min(
        sesion.expiraEn - MARGEN_VENCIMIENTO_MS - Date.now(),
        MAX_TIMEOUT_MS,
      ),
    )
    const temporizador = window.setTimeout(sesionVencida, espera)
    return () => window.clearTimeout(temporizador)
  }, [sesion, sesionVencida])

  // La pestaña necesita saber qué sesión tiene para decidir qué hacer ante un cambio externo.
  const sesionActual = useRef(sesion)
  useEffect(() => {
    sesionActual.current = sesion
  }, [sesion])

  // Cambios hechos en otra pestaña. El evento storage solo llega a las pestañas que no
  // hicieron el cambio, así que no hay ciclos.
  useEffect(() => {
    const alCambiar = (event: StorageEvent) => {
      if (event.storageArea !== almacen()) return
      if (event.key !== CLAVE_SESION && event.key !== null) return
      const actual = sesionActual.current
      const nueva = leerSesion(almacen(), Date.now())
      if (!nueva) {
        // Otra pestaña cerró la sesión o recibió un 401.
        setSesion(null)
        if (actual) irA('/login')
        return
      }
      if (actual && actual.usuario.id !== nueva.usuario.id) {
        // Otra pestaña entró con otro usuario: se recarga para no mezclar datos.
        window.location.reload()
        return
      }
      setSesion(nueva)
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const value = useMemo<AutenticacionValue>(
    () => ({ sesion, iniciarSesion, cerrarSesion, sesionVencida }),
    [sesion, iniciarSesion, cerrarSesion, sesionVencida],
  )
  return <AutenticacionContext value={value}>{children}</AutenticacionContext>
}
