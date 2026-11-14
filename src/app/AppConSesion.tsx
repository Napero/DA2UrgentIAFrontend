import { App } from './App'
import { useAutenticacion } from '../shared/session/autenticacion'

// Conecta la sesión de P3 con App. La sesión y los callbacks mantienen su referencia
// mientras no cambian, así las consultas de las pantallas no se reinician sin motivo.
export function AppConSesion() {
  const autenticacion = useAutenticacion()
  return (
    <App
      sesion={autenticacion?.sesion ?? null}
      onUnauthorized={autenticacion?.sesionVencida}
      onCerrarSesion={autenticacion?.cerrarSesion}
    />
  )
}
