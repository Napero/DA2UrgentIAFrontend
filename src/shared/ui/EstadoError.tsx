import { Icono } from './Icono'

export function EstadoError({
  titulo = 'No pudimos cargar la información',
  mensaje = 'Intentá nuevamente en unos momentos.',
  onReintentar,
}: {
  titulo?: string
  mensaje?: string
  onReintentar?: () => void
}) {
  return (
    <div className="feedback-state feedback-error" role="alert">
      <span className="state-icon">
        <Icono nombre="alerta" size={28} />
      </span>
      <h2>{titulo}</h2>
      <p>{mensaje}</p>
      {onReintentar && (
        <button
          type="button"
          className="button button-primary"
          onClick={onReintentar}
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
