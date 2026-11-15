import { useCallback } from 'react'
import { Link } from 'react-router'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { opcion, useFiltros } from '../../shared/hooks/useFiltros'
import { PageHeader, ErrorConsulta, Paginacion } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { EstadoVacio } from '../../shared/ui/EstadoVacio'
import { estados, prioridades } from './model'
import { FiltrosTickets, TablaTickets } from './TicketsUi'
import { useSeguimiento } from './useSeguimiento'
import './mis-tickets.css'

// El backend ya devuelve solo los tickets del solicitante (lo filtra con X-User-Id).
export function MisTicketsPage() {
  const servicios = useServicios()
  const { params, page, size, actualizar } = useFiltros()
  const estado = opcion(params.get('estado'), estados)
  const prioridad = opcion(params.get('prioridad'), prioridades)
  const hayFiltros = Boolean(estado || prioridad)
  const load = useCallback(
    (signal: AbortSignal) =>
      servicios.listarTickets({ estado, prioridad, page, size }, signal),
    [servicios, estado, prioridad, page, size],
  )
  const resource = useResource(params.toString(), load)
  const { tickets, cantidadPendientes } = useSeguimiento(resource.data?.content)

  return (
    <>
      <PageHeader
        titulo="Mis tickets"
        descripcion="Seguí el avance de tus solicitudes en un solo lugar."
        onActualizar={resource.reload}
      />
      <div className="mis-tickets-acciones">
        <Link to="/tickets/nuevo" className="button button-primary">
          Crear ticket
        </Link>
      </div>
      {cantidadPendientes > 0 && (
        <p className="notice" role="status">
          {cantidadPendientes === 1
            ? 'Un ticket todavía se está clasificando.'
            : `${cantidadPendientes} tickets todavía se están clasificando.`}{' '}
          La prioridad aparece sola cuando termina.
        </p>
      )}
      <section className="panel">
        <FiltrosTickets
          estado={estado}
          prioridad={prioridad}
          onChange={actualizar}
          conCategoria={false}
        />
        {resource.loading ? (
          <EstadoCarga />
        ) : resource.error ? (
          <ErrorConsulta
            error={resource.error}
            onReintentar={resource.reload}
          />
        ) : (
          resource.data &&
          tickets && (
            <>
              {tickets.length ? (
                <TablaTickets
                  rutaDetalle="/mis-tickets/"
                  tickets={tickets.map((ticket) => ({
                    ...ticket,
                    categoria: ticket.clasificacion?.categoria,
                  }))}
                />
              ) : hayFiltros ? (
                <EstadoVacio
                  titulo="No hay tickets para estos filtros"
                  descripcion="Probá con otro estado o prioridad."
                />
              ) : (
                <EstadoVacio
                  titulo="Todavía no creaste tickets"
                  descripcion="Cuando tengas un problema, contanos qué pasó y lo seguís desde acá."
                  icono="ticket"
                  accion={
                    <Link to="/tickets/nuevo" className="button button-primary">
                      Crear ticket
                    </Link>
                  }
                />
              )}
              <Paginacion
                page={resource.data.page}
                totalPages={resource.data.totalPages}
                totalElements={resource.data.totalElements}
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
