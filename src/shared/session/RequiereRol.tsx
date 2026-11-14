import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import type { Rol } from '../api/types'
import { useSesion } from './context'
import { EstadoVacio } from '../ui/EstadoVacio'
import { EstadoError } from '../ui/EstadoError'

export function RequiereRol({
  roles,
  children,
}: {
  roles: Rol[]
  children: ReactNode
}) {
  const { sesion, errorConfiguracion } = useSesion()
  const { pathname, search } = useLocation()
  if (!sesion)
    return (
      <EstadoVacio
        titulo="Iniciá sesión para continuar"
        descripcion="Ingresá con tu cuenta para acceder a esta sección."
        icono="usuarios"
        accion={
          <Link
            className="button button-primary"
            to="/login"
            state={{ volverA: pathname + search }}
          >
            Iniciar sesión
          </Link>
        }
      />
    )
  if (!roles.includes(sesion.usuario.rol))
    return (
      <EstadoVacio
        titulo="No tenés permiso para acceder"
        descripcion="Tu cuenta no tiene acceso a esta sección."
        icono="alerta"
        accion={
          <Link to="/" className="button button-secondary">
            Volver al inicio
          </Link>
        }
      />
    )
  if (errorConfiguracion)
    return (
      <EstadoError
        titulo="Falta configurar la conexión"
        mensaje={errorConfiguracion}
      />
    )
  return children
}
