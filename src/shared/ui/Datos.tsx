import { ApiError } from '../api'
import { EstadoError } from './EstadoError'

export function ErrorConsulta({
  error,
  onReintentar,
}: {
  error: Error
  onReintentar?: () => void
}) {
  let titulo = 'No pudimos completar la solicitud'
  if (error instanceof ApiError && error.status === 401)
    titulo = 'Tu sesión venció'
  if (error instanceof ApiError && error.status === 403)
    titulo = 'No tenés permiso para esta operación'
  if (error instanceof ApiError && error.status === 404)
    titulo = 'No encontramos el recurso'
  return (
    <>
      <EstadoError
        titulo={titulo}
        mensaje={error.message}
        onReintentar={onReintentar}
      />
      {error instanceof ApiError && error.correlationId && (
        <p className="error-reference">Referencia: {error.correlationId}</p>
      )}
    </>
  )
}

export function Paginacion({
  page,
  totalPages,
  totalElements,
  size,
  onPage,
  onSize,
}: {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPage: (value: number) => void
  onSize: (value: number) => void
}) {
  return (
    <nav className="pagination" aria-label="Paginación">
      <span>
        {totalElements} {totalElements === 1 ? 'resultado' : 'resultados'} ·
        Página {totalPages ? page + 1 : 0} de {totalPages}
      </span>
      <label>
        Por página{' '}
        <select
          value={size}
          onChange={(event) => onSize(Number(event.target.value))}
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </label>
      <div>
        <button
          className="button button-secondary"
          type="button"
          disabled={page <= 0}
          onClick={() => onPage(page - 1)}
        >
          Anterior
        </button>
        <button
          className="button button-secondary"
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  )
}

export function PageHeader({
  titulo,
  descripcion,
  onActualizar,
}: {
  titulo: string
  descripcion: string
  onActualizar?: () => void
}) {
  return (
    <div className="page-heading page-heading-actions">
      <div>
        <p className="eyebrow">MESA DE AYUDA</p>
        <h1>{titulo}</h1>
        <p>{descripcion}</p>
      </div>
      {onActualizar && (
        <button
          type="button"
          className="button button-secondary"
          onClick={onActualizar}
        >
          Actualizar
        </button>
      )}
    </div>
  )
}
