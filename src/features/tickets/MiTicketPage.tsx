import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { PageHeader, ErrorConsulta } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { BadgeEstado, BadgePrioridad } from './TicketsUi'
import { estaPendiente, fecha, slaVencido, textoEnum } from './model'
import { useSeguimiento } from './useSeguimiento'

// Detalle de solo lectura para el solicitante. Las acciones (asignar, cambiar estado,
// reclasificar) son de AGENTE y ADMIN y están en el detalle de P6.
export function MiTicketPage() {
  const { ticketId = '' } = useParams()
  const servicios = useServicios()
  const load = useCallback(
    (signal: AbortSignal) => servicios.obtenerTicket(ticketId, signal),
    [servicios, ticketId],
  )
  const resource = useResource(ticketId, load)
  const lista = useMemo(
    () => (resource.data ? [resource.data] : undefined),
    [resource.data],
  )
  const ticket = useSeguimiento(lista).tickets?.[0]

  return (
    <>
      <Link to="/mis-tickets" className="back-link">
        ← Volver a mis tickets
      </Link>
      <PageHeader
        titulo="Detalle del ticket"
        descripcion="El estado de tu solicitud y lo que sabemos hasta ahora."
        onActualizar={resource.reload}
      />
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
        ticket && (
          <section className="panel detail-summary">
            <div className="detail-badges">
              <BadgeEstado estado={ticket.estado} />
              <BadgePrioridad prioridad={ticket.prioridad} />
            </div>
            <h2>{ticket.titulo}</h2>
            <p className="ticket-description">{ticket.descripcion}</p>
            {estaPendiente(ticket) && (
              <p className="notice" role="status">
                Estamos analizando tu ticket. La prioridad y el plazo de
                resolución aparecen solos cuando termine la clasificación.
              </p>
            )}
            <dl className="detail-grid">
              <div>
                <dt>Plazo de resolución</dt>
                <dd>
                  {ticket.fechaLimiteSla ? (
                    <span className={slaVencido(ticket) ? 'text-danger' : ''}>
                      {fecha(ticket.fechaLimiteSla)}
                      {slaVencido(ticket) && ' · Vencido'}
                    </span>
                  ) : (
                    'Todavía sin plazo'
                  )}
                </dd>
              </div>
              <div>
                <dt>Categoría</dt>
                <dd>{textoEnum(ticket.clasificacion?.categoria)}</dd>
              </div>
              <div>
                <dt>Módulo afectado</dt>
                <dd>{textoEnum(ticket.clasificacion?.moduloAfectado)}</dd>
              </div>
              <div>
                <dt>Agente</dt>
                <dd>
                  {ticket.agenteAsignadoId
                    ? 'Un agente ya está trabajando en tu ticket'
                    : 'Todavía sin agente asignado'}
                </dd>
              </div>
              {ticket.motivoEscalamiento && (
                <div>
                  <dt>Derivado a la guardia</dt>
                  <dd>{ticket.motivoEscalamiento}</dd>
                </div>
              )}
              <div>
                <dt>Creado</dt>
                <dd>{fecha(ticket.fechaCreacion)}</dd>
              </div>
              <div>
                <dt>Última actualización</dt>
                <dd>{fecha(ticket.fechaActualizacion)}</dd>
              </div>
            </dl>
          </section>
        )
      )}
    </>
  )
}
