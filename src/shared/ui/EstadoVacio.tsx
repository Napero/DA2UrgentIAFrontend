import type { ReactNode } from 'react'
import { Icono, type NombreIcono } from './Icono'

export function EstadoVacio({
  titulo,
  descripcion,
  icono = 'ticket',
  accion,
}: {
  titulo: string
  descripcion: string
  icono?: NombreIcono
  accion?: ReactNode
}) {
  return (
    <div className="feedback-state">
      <span className="state-icon">
        <Icono nombre={icono} size={28} />
      </span>
      <h2>{titulo}</h2>
      <p>{descripcion}</p>
      {accion}
    </div>
  )
}
