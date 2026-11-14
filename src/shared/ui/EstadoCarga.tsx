export function EstadoCarga({
  mensaje = 'Cargando información…',
}: {
  mensaje?: string
}) {
  return (
    <div className="feedback-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  )
}
