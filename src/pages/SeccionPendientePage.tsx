import { Link } from 'react-router'
import type { Seccion } from '../app/navigation'
import { EstadoVacio } from '../shared/ui/EstadoVacio'

export function SeccionPendientePage({
  seccion,
}: {
  seccion: Pick<Seccion, 'titulo' | 'descripcion' | 'icono'>
}) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">MESA DE AYUDA</p>
        <h1>{seccion.titulo}</h1>
        <p>{seccion.descripcion}</p>
      </div>
      <section className="panel">
        <EstadoVacio
          titulo="Próximamente"
          descripcion="Estamos preparando esta sección. Pronto vas a poder usarla desde acá."
          icono={seccion.icono}
          accion={
            <Link to="/" className="button button-secondary">
              Volver al inicio
            </Link>
          }
        />
      </section>
    </>
  )
}
