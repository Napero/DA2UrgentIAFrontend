import { useCallback } from 'react'
import { useServicios } from '../../shared/session/context'
import { useResource } from '../../shared/hooks/useResource'
import { opcion, useFiltros } from '../../shared/hooks/useFiltros'
import { PageHeader, ErrorConsulta, Paginacion } from '../../shared/ui/Datos'
import { EstadoCarga } from '../../shared/ui/EstadoCarga'
import { EstadoVacio } from '../../shared/ui/EstadoVacio'
import { estados, prioridades, categorias } from './model'
import { FiltrosTickets, TablaTickets } from './TicketsUi'

export function BandejaPage() {
  const servicios = useServicios()
  const { params, page, size, actualizar } = useFiltros()
  const estado = opcion(params.get('estado'), estados)
  const prioridad = opcion(params.get('prioridad'), prioridades)
  const categoria = opcion(params.get('categoria'), categorias)
  const load = useCallback(
    (signal: AbortSignal) =>
      servicios.listarTickets(
        { estado, prioridad, categoria, page, size },
        signal,
      ),
    [servicios, estado, prioridad, categoria, page, size],
  )
  const resource = useResource(params.toString(), load)
  return (
    <>
      <PageHeader
        titulo="Bandeja de tickets"
        descripcion="Organizá la atención por estado, prioridad y categoría."
        onActualizar={resource.reload}
      />
      <section className="panel">
        <FiltrosTickets
          estado={estado}
          prioridad={prioridad}
          categoria={categoria}
          onChange={actualizar}
        />
        {resource.loading ? (
          <EstadoCarga />
        ) : resource.error ? (
          <ErrorConsulta
            error={resource.error}
            onReintentar={resource.reload}
          />
        ) : (
          resource.data && (
            <>
              {resource.data.content.length ? (
                <TablaTickets
                  tickets={resource.data.content.map((ticket) => ({
                    ...ticket,
                    categoria: ticket.clasificacion?.categoria,
                  }))}
                />
              ) : (
                <EstadoVacio
                  titulo="No hay tickets para estos filtros"
                  descripcion="Probá con otro estado, prioridad o categoría."
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
