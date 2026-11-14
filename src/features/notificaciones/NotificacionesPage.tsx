import { useCallback, type FormEvent } from 'react'
import { Link } from 'react-router'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { useFiltros } from '../../shared/hooks/useFiltros'
import { PageHeader, Paginacion, ErrorConsulta } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { EstadoVacio } from '../../shared/ui/EstadoVacio'
import { fecha, textoEnum } from '../tickets/model'

export function NotificacionesPage() {
  const servicios = useServicios()
  const { params, page, size, actualizar } = useFiltros()
  const ticketId = params.get('ticketId')?.trim() || undefined
  const destinatario = params.get('destinatario')?.trim() || undefined
  const load = useCallback(
    (signal: AbortSignal) =>
      servicios.notificaciones({ ticketId, destinatario, page, size }, signal),
    [servicios, ticketId, destinatario, page, size],
  )
  const { data, loading, error, reload } = useResource(params.toString(), load)
  const filtrar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    actualizar({
      ticketId: String(values.get('ticketId') ?? '').trim(),
      destinatario: String(values.get('destinatario') ?? '').trim(),
    })
  }
  return (
    <>
      <PageHeader
        titulo="Notificaciones"
        descripcion="Consultá los avisos enviados y las entregas que fallaron."
        onActualizar={reload}
      />
      <section className="panel">
        <form
          className="filters"
          onSubmit={filtrar}
          key={(ticketId ?? '') + '|' + (destinatario ?? '')}
        >
          <label>
            ID del ticket
            <input
              name="ticketId"
              defaultValue={ticketId}
              placeholder="UUID del ticket"
              pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"
              title="Ingresá un UUID válido"
            />
          </label>
          <label>
            Destinatario
            <input
              name="destinatario"
              defaultValue={destinatario}
              placeholder="GRUPO:GUARDIA o USUARIO:uuid"
            />
          </label>
          <button type="submit" className="button button-primary">
            Filtrar
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              actualizar({ ticketId: undefined, destinatario: undefined })
            }
          >
            Limpiar filtros
          </button>
        </form>
        {loading ? (
          <EstadoCarga />
        ) : error ? (
          <ErrorConsulta error={error} onReintentar={reload} />
        ) : (
          data && (
            <>
              {data.content.length ? (
                <div className="notifications-list">
                  {data.content.map((notificacion) => (
                    <article
                      className="notification-card"
                      key={notificacion.id}
                    >
                      <div className="notification-meta">
                        <span
                          className={
                            'badge ' +
                            (notificacion.estado === 'FALLIDA'
                              ? 'warning'
                              : 'success')
                          }
                        >
                          {textoEnum(notificacion.estado)}
                        </span>
                        <span>{textoEnum(notificacion.canal)}</span>
                        <time dateTime={notificacion.fecha}>
                          {fecha(notificacion.fecha)}
                        </time>
                      </div>
                      <h2>{notificacion.asunto}</h2>
                      <p className="notification-message">
                        {notificacion.mensaje}
                      </p>
                      <p className="muted">
                        Destinatario: {notificacion.destinatario}
                      </p>
                      <div className="notification-footer">
                        <Link
                          className="ticket-link"
                          to={
                            '/tickets/' +
                            encodeURIComponent(notificacion.ticketId)
                          }
                        >
                          Ver ticket
                        </Link>
                        <span className="muted">
                          {textoEnum(notificacion.tipoEvento)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <EstadoVacio
                  titulo="No hay notificaciones para estos filtros"
                  descripcion="Los avisos aparecerán cuando se procesen los eventos de tickets."
                  icono="notificaciones"
                />
              )}
              <Paginacion
                page={data.page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                size={size}
                onPage={(value) => actualizar({ page: value })}
                onSize={(value) => actualizar({ size: value })}
              />
            </>
          )
        )}
      </section>
    </>
  )
}
