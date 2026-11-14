import { Link } from 'react-router'
import { EstadoVacio } from '../shared/ui/EstadoVacio'

export function NoEncontradoPage() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">ERROR 404</p>
        <h1>No encontramos esta página</h1>
      </div>
      <section className="panel">
        <EstadoVacio
          titulo="Busquemos otro camino"
          descripcion="La dirección que abriste no está disponible. Podés volver al inicio para continuar."
          icono="inicio"
          accion={
            <Link className="button button-primary" to="/">
              Volver al inicio
            </Link>
          }
        />
      </section>
    </>
  )
}
