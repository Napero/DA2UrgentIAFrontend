import { useCallback } from 'react'
import { Link } from 'react-router'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { opcion, useFiltros } from '../../shared/hooks/useFiltros'
import { PageHeader, ErrorConsulta, Paginacion } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { EstadoVacio } from '../../shared/ui/EstadoVacio'
import {
  estados,
  prioridades,
  categorias,
  fecha,
  textoEnum,
} from '../tickets/model'
import {
  BadgeEstado,
  BadgePrioridad,
  FiltrosTickets,
  TablaTickets,
} from '../tickets/TicketsUi'

export function ReportesPage() {
  const { params, actualizar } = useFiltros()
  const vista =
    params.get('vista') === 'sla'
      ? 'sla'
      : params.get('vista') === 'tickets'
        ? 'tickets'
        : 'resumen'
  return (
    <>
      <PageHeader
        titulo="Reportes"
        descripcion="Seguí el volumen de atención, las prioridades y el cumplimiento del SLA."
      />
      <nav className="tabs" aria-label="Secciones de reportes">
        {[
          ['resumen', 'Resumen'],
          ['sla', 'SLA'],
          ['tickets', 'Listado de tickets'],
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={'tab ' + (vista === key ? 'tab-active' : '')}
            aria-current={vista === key ? 'page' : undefined}
            onClick={() => actualizar({ vista: key, page: 0 })}
          >
            {label}
          </button>
        ))}
      </nav>
      {vista === 'resumen' ? (
        <ResumenPanel />
      ) : vista === 'sla' ? (
        <SlaPanel />
      ) : (
        <TicketsReporte />
      )}
    </>
  )
}

function Distribucion({
  titulo,
  valores,
  etiquetas,
}: {
  titulo: string
  valores: Record<string, number>
  etiquetas: Record<string, string>
}) {
  const total = Object.values(valores).reduce((sum, valor) => sum + valor, 0)
  return (
    <section className="panel content-panel">
      <h2>{titulo}</h2>
      <dl className="distribution">
        {Object.entries(valores).map(([key, value]) => (
          <div key={key}>
            <dt>{etiquetas[key] ?? textoEnum(key)}</dt>
            <dd>
              <span>{value}</span>
              <span className="distribution-track" aria-hidden="true">
                <span
                  style={{ width: (total ? (value / total) * 100 : 0) + '%' }}
                />
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function ResumenPanel() {
  const servicios = useServicios()
  const load = useCallback(
    (signal: AbortSignal) => servicios.resumen(signal),
    [servicios],
  )
  const { data, loading, error, reload } = useResource('resumen', load)
  if (loading)
    return (
      <section className="panel">
        <EstadoCarga />
      </section>
    )
  if (error)
    return (
      <section className="panel">
        <ErrorConsulta error={error} onReintentar={reload} />
      </section>
    )
  if (!data) return null
  return (
    <>
      <div className="report-toolbar">
        <p className="muted">Actualizado: {fecha(data.generadoEn)}</p>
        <button
          type="button"
          className="button button-secondary"
          onClick={reload}
        >
          Actualizar resumen
        </button>
      </div>
      <div className="stats-grid">
        {[
          ['Tickets totales', data.total],
          ['Abiertos', data.abiertos],
          ['Escalados', data.escalados],
          ['SLA vencidos', data.slaVencidos],
        ].map(([label, value]) => (
          <div className="panel stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {data.total === 0 && (
        <p className="notice">
          Todavía no hay tickets en los reportes. Los eventos procesados
          aparecerán acá.
        </p>
      )}
      <div className="report-grid">
        <Distribucion
          titulo="Por prioridad"
          valores={data.porPrioridad}
          etiquetas={{ ...prioridades, SIN_PRIORIDAD: 'Sin prioridad' }}
        />
        <Distribucion
          titulo="Por categoría"
          valores={data.porCategoria}
          etiquetas={{ ...categorias, SIN_CATEGORIA: 'Sin categoría' }}
        />
        <Distribucion
          titulo="Por estado"
          valores={data.porEstado}
          etiquetas={estados}
        />
      </div>
      <p className="muted section-block">
        Los reportes se actualizan cuando se procesan los eventos de tickets.
        Puede haber una demora respecto de la bandeja.
      </p>
    </>
  )
}

function SlaPanel() {
  const servicios = useServicios()
  const load = useCallback(
    (signal: AbortSignal) => servicios.sla(signal),
    [servicios],
  )
  const { data, loading, error, reload } = useResource('sla', load)
  if (loading)
    return (
      <section className="panel">
        <EstadoCarga />
      </section>
    )
  if (error)
    return (
      <section className="panel">
        <ErrorConsulta error={error} onReintentar={reload} />
      </section>
    )
  if (!data) return null
  return (
    <>
      <div className="report-toolbar">
        <p className="muted">Actualizado: {fecha(data.generadoEn)}</p>
        <button
          type="button"
          className="button button-secondary"
          onClick={reload}
        >
          Actualizar SLA
        </button>
      </div>
      <section className="panel content-panel">
        <h2>Cumplimiento por prioridad</h2>
        <p className="muted">
          Resoluciones en término según los datos del reporte.
        </p>
        <div className="table-scroll">
          <table className="data-table">
            <caption className="sr-only">
              Cumplimiento de SLA por prioridad
            </caption>
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Resueltos</th>
                <th>En término</th>
                <th>Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.cumplimientoPorPrioridad).map(
                ([prioridad, values]) => (
                  <tr key={prioridad}>
                    <td>{prioridad}</td>
                    <td>{values.resueltos}</td>
                    <td>{values.enTermino}</td>
                    <td>
                      {values.porcentaje === null
                        ? 'Sin tickets resueltos'
                        : values.porcentaje.toLocaleString('es-AR', {
                            maximumFractionDigits: 2,
                          }) + '%'}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel content-panel section-block">
        <h2>Tickets con SLA vencido</h2>
        {data.vencidos.length ? (
          <div className="table-scroll">
            <table className="data-table">
              <caption className="sr-only">Tickets con SLA vencido</caption>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Vencimiento</th>
                  <th>Horas vencido</th>
                </tr>
              </thead>
              <tbody>
                {data.vencidos.map((ticket) => (
                  <tr key={ticket.ticketId}>
                    <td>
                      <Link
                        className="ticket-link"
                        to={'/tickets/' + encodeURIComponent(ticket.ticketId)}
                      >
                        {ticket.titulo}
                      </Link>
                    </td>
                    <td>
                      <BadgePrioridad prioridad={ticket.prioridad} />
                    </td>
                    <td>
                      <BadgeEstado estado={ticket.estado} />
                    </td>
                    <td>{fecha(ticket.fechaLimiteSla)}</td>
                    <td>
                      {ticket.horasVencido.toLocaleString('es-AR', {
                        maximumFractionDigits: 1,
                      })}{' '}
                      h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVacio
            titulo="No hay SLA vencidos"
            descripcion="No hay tickets abiertos fuera del plazo de resolución en este reporte."
            icono="listo"
          />
        )}
      </section>
    </>
  )
}

function TicketsReporte() {
  const servicios = useServicios()
  const { params, page, size, actualizar } = useFiltros()
  const estado = opcion(params.get('estado'), estados)
  const prioridad = opcion(params.get('prioridad'), prioridades)
  const load = useCallback(
    (signal: AbortSignal) =>
      servicios.ticketsReporte({ estado, prioridad, page, size }, signal),
    [servicios, estado, prioridad, page, size],
  )
  const { data, loading, error, reload } = useResource(params.toString(), load)
  return (
    <section className="panel">
      <div className="report-toolbar content-panel">
        <p className="muted">Listado proyectado a partir de los eventos.</p>
        <button
          className="button button-secondary"
          type="button"
          onClick={reload}
        >
          Actualizar listado
        </button>
      </div>
      <FiltrosTickets
        estado={estado}
        prioridad={prioridad}
        conCategoria={false}
        onChange={actualizar}
      />
      {loading ? (
        <EstadoCarga />
      ) : error ? (
        <ErrorConsulta error={error} onReintentar={reload} />
      ) : (
        data && (
          <>
            {data.content.length ? (
              <TablaTickets
                tickets={data.content.map((ticket) => ({
                  ...ticket,
                  id: ticket.ticketId,
                }))}
              />
            ) : (
              <EstadoVacio
                titulo="No hay tickets en este reporte"
                descripcion="Probá cambiando los filtros o actualizá cuando se procesen nuevos eventos."
                icono="reportes"
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
  )
}
