import { createRoot } from 'react-dom/client'
import { App } from '../../src/app/App'
import type { Sesion } from '../../src/shared/api/types'
import '../../src/app/layout/layout.css'
import '../../src/shared/ui/datos.css'

// Entrada exclusiva de pruebas. No es parte del build de producción.
// El token es ficticio y solo funciona contra las respuestas interceptadas por Playwright.
const params = new URLSearchParams(window.location.search)
const rol = params.get('rol')
const sesion: Sesion | null =
  rol === 'AGENTE' || rol === 'ADMIN' || rol === 'SOLICITANTE'
    ? {
        accessToken: 'token-ficticio-e2e',
        usuario: {
          id: 'b1c2d3e4-0000-4000-8000-000000000001',
          nombre: 'Cuenta de prueba',
          email: 'prueba@urgentia.local',
          rol,
        },
      }
    : null
window.history.replaceState({}, '', params.get('ruta') ?? '/')
createRoot(document.getElementById('root')!).render(
  <App
    sesion={sesion}
    onUnauthorized={() => window.location.assign('/login')}
    onCerrarSesion={() => window.location.assign('/login')}
  />,
)
