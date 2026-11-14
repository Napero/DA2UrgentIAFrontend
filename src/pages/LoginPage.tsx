import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { ApiError, type DetalleError } from '../shared/api'
import { useAutenticacion } from '../shared/session/autenticacion'
import {
  destinoInicial,
  rutaDeRetornoSegura,
} from '../shared/session/almacenamiento'
import { EstadoError } from '../shared/ui/EstadoError'
import './login.css'

interface ErrorLogin {
  mensaje: string
  detalles: DetalleError[]
}

function errorDeLogin(causa: unknown): ErrorLogin {
  if (causa instanceof ApiError) {
    if (causa.status === 401)
      return {
        mensaje: 'El email o la contraseña no son correctos.',
        detalles: [],
      }
    // Red, timeout, 400 con detalles o un error del servidor: el cliente ya arma el mensaje.
    return { mensaje: causa.message, detalles: causa.detalles }
  }
  return {
    mensaje: 'No pudimos iniciar sesión. Intentá nuevamente.',
    detalles: [],
  }
}

export function LoginPage() {
  const autenticacion = useAutenticacion()
  const { state, search } = useLocation()
  const params = new URLSearchParams(search)
  const volverA =
    rutaDeRetornoSegura((state as { volverA?: unknown } | null)?.volverA) ??
    rutaDeRetornoSegura(params.get('volverA'))
  const sesionVencida = params.get('motivo') === 'vencida'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<ErrorLogin | null>(null)

  useEffect(() => {
    document.title = 'Iniciar sesión · UrgentIA'
  }, [])

  // Con sesión iniciada no hay nada que hacer acá: va a la pantalla pedida o a la de su rol.
  if (autenticacion?.sesion)
    return (
      <Navigate
        to={volverA ?? destinoInicial(autenticacion.sesion.usuario.rol)}
        replace
      />
    )

  const enviar = async (event: FormEvent) => {
    event.preventDefault()
    if (!autenticacion || enviando) return
    setEnviando(true)
    setError(null)
    try {
      await autenticacion.iniciarSesion({ email: email.trim(), password })
      // La navegación la hace el <Navigate> de arriba cuando llega la sesión.
    } catch (causa) {
      setError(errorDeLogin(causa))
      setEnviando(false)
    }
  }

  return (
    <main className="login-shell">
      <Link to="/" className="login-brand">
        <img src="/favicon.svg" alt="" width="48" height="48" />
        UrgentIA
      </Link>
      <h1>Iniciar sesión</h1>
      <section className="panel login-panel">
        {!autenticacion ? (
          <EstadoError
            titulo="El inicio de sesión no está disponible"
            mensaje="La aplicación se abrió sin el proveedor de sesión."
          />
        ) : (
          <form className="login-form" onSubmit={enviar}>
            {sesionVencida && !error && (
              <p className="notice warning" role="status">
                Tu sesión venció. Iniciá sesión de nuevo para continuar.
              </p>
            )}
            {error && (
              <div className="notice warning" role="alert">
                <p>{error.mensaje}</p>
                {error.detalles.length > 0 && (
                  <ul>
                    {error.detalles.map((detalle) => (
                      <li key={detalle.campo + detalle.mensaje}>
                        {detalle.campo}: {detalle.mensaje}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <label>
              Email
              <input
                type="email"
                name="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={enviando}
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={enviando}
              />
            </label>
            <button
              type="submit"
              className="button button-primary"
              disabled={enviando}
            >
              {enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
