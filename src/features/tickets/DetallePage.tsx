import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'
import type { EstadoTicket, Ticket } from '../../shared/api/types'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { PageHeader, ErrorConsulta } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { BadgeEstado, BadgePrioridad } from './TicketsUi'
import {
  estados,
  estadosDisponibles,
  puedeAsignar,
  puedeReclasificar,
  estaPendiente,
  fecha,
  textoEnum,
} from './model'

export function DetallePage() {
  const { ticketId = '' } = useParams()
  const servicios = useServicios()
  const load = useCallback(
    (signal: AbortSignal) => servicios.obtenerTicket(ticketId, signal),
    [servicios, ticketId],
  )
  const resource = useResource(ticketId, load)
  const { reload } = resource
  const [resultado, setResultado] = useState<{
    ticketId: string
    mensaje: string
  } | null>(null)
  const pendiente = resource.data ? estaPendiente(resource.data) : false
  useEffect(() => {
    if (!pendiente) return
    const interval = setInterval(() => {
      if (!document.hidden) reload()
    }, 5000)
    return () => clearInterval(interval)
  }, [pendiente, reload])
  return (
    <>
      <Link to="/tickets" className="back-link">
        ← Volver a la bandeja
      </Link>
      <PageHeader
        titulo="Detalle del ticket"
        descripcion="Consultá la clasificación y acompañá cada avance."
        onActualizar={resource.reload}
      />
      {resultado?.ticketId === ticketId && (
        <p role="status" className="notice">
          {resultado.mensaje}
        </p>
      )}
      {resource.loading ? (
        <section className="panel">
          <EstadoCarga />
        </section>
      ) : resource.error ? (
        <section className="panel">
          <ErrorConsulta
            error={resource.error}
            onReintentar={resource.reload}
          />
        </section>
      ) : (
        resource.data && (
          <ContenidoTicket
            key={resource.data.id + resource.data.fechaActualizacion}
            ticket={resource.data}
            onExito={(mensaje) => {
              setResultado({ ticketId, mensaje })
              reload()
            }}
          />
        )
      )}
    </>
  )
}

function ContenidoTicket({
  ticket,
  onExito,
}: {
  ticket: Ticket
  onExito: (mensaje: string) => void
}) {
  const servicios = useServicios()
  const [agenteId, setAgenteId] = useState(ticket.agenteAsignadoId ?? '')
  const [nuevoEstado, setNuevoEstado] = useState<EstadoTicket | ''>('')
  const [motivo, setMotivo] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [aviso, setAviso] = useState('')
  const asignable = puedeAsignar(ticket)
  const estadosPermitidos = estadosDisponibles(ticket)
  const loadAgentes = useCallback(
    (signal: AbortSignal) =>
      asignable ? servicios.listarAgentes(signal) : Promise.resolve([]),
    [servicios, asignable],
  )
  const agentes = useResource('agentes-' + ticket.id, loadAgentes)
  const ejecutar = async (
    operacion: () => Promise<Ticket>,
    mensaje: string,
  ) => {
    setOcupado(true)
    setError(null)
    setAviso('')
    try {
      await operacion()
      onExito(mensaje)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause
          : new Error('No se pudo completar la operación.'),
      )
    } finally {
      setOcupado(false)
    }
  }
  const asignar = (event: FormEvent) => {
    event.preventDefault()
    if (agenteId)
      void ejecutar(
        () => servicios.asignarTicket(ticket.id, { agenteId }),
        'Asignación actualizada.',
      )
  }
  const cambiar = (event: FormEvent) => {
    event.preventDefault()
    if (!nuevoEstado) return
    if (nuevoEstado === 'ESCALADO' && !motivo.trim()) {
      setAviso('Ingresá el motivo del escalamiento.')
      return
    }
    void ejecutar(
      () =>
        servicios.cambiarEstado(ticket.id, {
          estado: nuevoEstado,
          ...(nuevoEstado === 'ESCALADO' ? { motivo: motivo.trim() } : {}),
        }),
      'Estado actualizado.',
    )
  }
  return (
    <>
      <section className="panel detail-summary">
        <div className="detail-badges">
          <BadgeEstado estado={ticket.estado} />
          <BadgePrioridad prioridad={ticket.prioridad} />
          {ticket.requiereRevisionManual && (
            <span className="badge warning">Revisión manual</span>
          )}
        </div>
        <h2>{ticket.titulo}</h2>
        <p className="identifier">{ticket.id}</p>
        <p className="ticket-description">{ticket.descripcion}</p>
        {estaPendiente(ticket) && (
          <p className="notice" role="status">
            La clasificación todavía está pendiente. Esta vista se actualiza
            cada 5 segundos mientras esté abierta.
          </p>
        )}
        {ticket.motivoEscalamiento && (
          <p className="notice warning">
            <strong>Motivo del escalamiento:</strong>{' '}
            {ticket.motivoEscalamiento}
          </p>
        )}
        <dl className="detail-grid">
          <div>
            <dt>Solicitante</dt>
            <dd>{ticket.solicitanteId}</dd>
          </div>
          <div>
            <dt>Agente asignado</dt>
            <dd>{ticket.agenteAsignadoId ?? 'Sin asignar'}</dd>
          </div>
          <div>
            <dt>Creado</dt>
            <dd>{fecha(ticket.fechaCreacion)}</dd>
          </div>
          <div>
            <dt>Última actualización</dt>
            <dd>{fecha(ticket.fechaActualizacion)}</dd>
          </div>
          <div>
            <dt>Vencimiento del SLA</dt>
            <dd>
              {ticket.fechaLimiteSla
                ? fecha(ticket.fechaLimiteSla)
                : 'Pendiente de clasificación'}
            </dd>
          </div>
        </dl>
      </section>
      <section className="panel section-block content-panel">
        <h2>Clasificación</h2>
        {ticket.clasificacion ? (
          <>
            <dl className="detail-grid">
              <div>
                <dt>Categoría</dt>
                <dd>{textoEnum(ticket.clasificacion.categoria)}</dd>
              </div>
              <div>
                <dt>Urgencia</dt>
                <dd>{textoEnum(ticket.clasificacion.urgencia)}</dd>
              </div>
              <div>
                <dt>Impacto</dt>
                <dd>{textoEnum(ticket.clasificacion.impacto)}</dd>
              </div>
              <div>
                <dt>Módulo afectado</dt>
                <dd>{textoEnum(ticket.clasificacion.moduloAfectado)}</dd>
              </div>
              <div>
                <dt>Confianza</dt>
                <dd>{Math.round(ticket.clasificacion.confianza * 100)}%</dd>
              </div>
              <div>
                <dt>Clasificado</dt>
                <dd>{fecha(ticket.clasificacion.fecha)}</dd>
              </div>
            </dl>
            {ticket.clasificacion.justificacion && (
              <p className="ticket-description">
                {ticket.clasificacion.justificacion}
              </p>
            )}
          </>
        ) : (
          <p className="muted">Todavía no hay una clasificación disponible.</p>
        )}
      </section>
      <section
        className="panel section-block content-panel"
        aria-labelledby="acciones-titulo"
      >
        <h2 id="acciones-titulo">Acciones del ticket</h2>
        {aviso && (
          <p role="status" className="notice">
            {aviso}
          </p>
        )}
        {error && <ErrorConsulta error={error} />}
        <div className="actions-grid">
          {asignable && (
            <form onSubmit={asignar}>
              <h3>Asignar agente</h3>
              {agentes.error ? (
                <ErrorConsulta
                  error={agentes.error}
                  onReintentar={agentes.reload}
                />
              ) : (
                <>
                  <label>
                    Agente
                    <select
                      value={agenteId}
                      disabled={ocupado || agentes.loading}
                      onChange={(event) => setAgenteId(event.target.value)}
                      required
                    >
                      <option value="">
                        {agentes.loading
                          ? 'Cargando agentes…'
                          : 'Seleccioná un agente'}
                      </option>
                      {agentes.data?.map((usuario) => (
                        <option key={usuario.id} value={usuario.id}>
                          {usuario.nombre} · {usuario.email}
                        </option>
                      ))}
                    </select>
                  </label>
                  {!agentes.loading && agentes.data?.length === 0 && (
                    <p className="muted">
                      No hay agentes activos para asignar.
                    </p>
                  )}
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={
                      ocupado ||
                      agentes.loading ||
                      !agentes.data?.some((usuario) => usuario.id === agenteId)
                    }
                  >
                    Asignar
                  </button>
                </>
              )}
            </form>
          )}
          {estadosPermitidos.length > 0 && (
            <form onSubmit={cambiar}>
              <h3>Cambiar estado</h3>
              <label>
                Nuevo estado
                <select
                  required
                  value={nuevoEstado}
                  disabled={ocupado}
                  onChange={(event) =>
                    setNuevoEstado(event.target.value as EstadoTicket | '')
                  }
                >
                  <option value="">Seleccioná el estado</option>
                  {estadosPermitidos.map((estado) => (
                    <option key={estado} value={estado}>
                      {estados[estado]}
                    </option>
                  ))}
                </select>
              </label>
              {nuevoEstado === 'ESCALADO' && (
                <label>
                  Motivo del escalamiento
                  <textarea
                    required
                    value={motivo}
                    disabled={ocupado}
                    onChange={(event) => setMotivo(event.target.value)}
                  />
                </label>
              )}
              <button
                type="submit"
                className="button button-primary"
                disabled={
                  ocupado ||
                  !nuevoEstado ||
                  (nuevoEstado === 'ESCALADO' && !motivo.trim())
                }
              >
                Guardar estado
              </button>
            </form>
          )}
          {puedeReclasificar(ticket) && (
            <div>
              <h3>Reclasificar con IA</h3>
              <p className="muted">
                Vuelve a analizar el ticket. El dominio recalcula su prioridad y
                SLA.
              </p>
              <button
                type="button"
                className="button button-secondary"
                disabled={ocupado}
                onClick={() => {
                  void ejecutar(
                    () => servicios.reclasificar(ticket.id),
                    'Clasificación actualizada.',
                  )
                }}
              >
                Reclasificar
              </button>
            </div>
          )}
        </div>
        {ocupado && (
          <p role="status" className="notice">
            Guardando cambios…
          </p>
        )}
        {!asignable &&
          !puedeReclasificar(ticket) &&
          estadosPermitidos.length === 0 && (
            <p className="muted">
              {ticket.estado === 'CERRADO'
                ? 'El ticket está cerrado y no admite más cambios.'
                : 'No hay acciones disponibles en el estado actual. Para iniciar o resolver un ticket se necesita un agente asignado.'}
            </p>
          )}
      </section>
    </>
  )
}
