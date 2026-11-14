import { Link } from 'react-router'
import type {
  Categoria,
  EstadoTicket,
  Prioridad,
  Ticket,
} from '../../shared/api/types'
import { estados, prioridades, categorias, fecha, slaVencido } from './model'

export function BadgeEstado({ estado }: { estado: EstadoTicket }) {
  return (
    <span className={'badge estado-' + estado.toLowerCase()}>
      {estados[estado]}
    </span>
  )
}
export function BadgePrioridad({
  prioridad,
}: {
  prioridad?: Prioridad | null
}) {
  return (
    <span className={'badge prioridad-' + (prioridad ?? 'sin').toLowerCase()}>
      {prioridad ? prioridades[prioridad] : 'Sin prioridad'}
    </span>
  )
}
export function FiltrosTickets({
  estado,
  prioridad,
  categoria,
  onChange,
  conCategoria = true,
}: {
  estado?: EstadoTicket
  prioridad?: Prioridad
  categoria?: Categoria
  onChange: (values: Record<string, string | undefined>) => void
  conCategoria?: boolean
}) {
  return (
    <div className="filters" role="group" aria-label="Filtros de tickets">
      <label>
        Estado
        <select
          value={estado ?? ''}
          onChange={(event) => onChange({ estado: event.target.value })}
        >
          <option value="">Todos los estados</option>
          {Object.entries(estados).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <label>
        Prioridad
        <select
          value={prioridad ?? ''}
          onChange={(event) => onChange({ prioridad: event.target.value })}
        >
          <option value="">Todas las prioridades</option>
          {Object.entries(prioridades).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>
      {conCategoria && (
        <label>
          Categoría
          <select
            value={categoria ?? ''}
            onChange={(event) => onChange({ categoria: event.target.value })}
          >
            <option value="">Todas las categorías</option>
            {Object.entries(categorias).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </label>
      )}
      <button
        type="button"
        className="button button-secondary"
        onClick={() =>
          onChange({
            estado: undefined,
            prioridad: undefined,
            categoria: undefined,
          })
        }
      >
        Limpiar filtros
      </button>
    </div>
  )
}

type FilaTicket = Pick<
  Ticket,
  'id' | 'titulo' | 'estado' | 'prioridad' | 'fechaLimiteSla' | 'fechaCreacion'
> & { categoria?: Categoria | null }
export function TablaTickets({ tickets }: { tickets: FilaTicket[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="sr-only">Listado de tickets</caption>
        <thead>
          <tr>
            <th scope="col">Ticket</th>
            <th scope="col">Estado</th>
            <th scope="col">Prioridad</th>
            <th scope="col">Categoría</th>
            <th scope="col">Creado</th>
            <th scope="col">SLA</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <Link
                  className="ticket-link"
                  to={'/tickets/' + encodeURIComponent(ticket.id)}
                >
                  {ticket.titulo}
                </Link>
                <small className="identifier">{ticket.id}</small>
              </td>
              <td>
                <BadgeEstado estado={ticket.estado} />
              </td>
              <td>
                <BadgePrioridad prioridad={ticket.prioridad} />
              </td>
              <td>
                {ticket.categoria
                  ? categorias[ticket.categoria]
                  : 'Sin categoría'}
              </td>
              <td className="date-cell">{fecha(ticket.fechaCreacion)}</td>
              <td className="date-cell">
                {ticket.fechaLimiteSla ? (
                  <>
                    <span className={slaVencido(ticket) ? 'text-danger' : ''}>
                      {fecha(ticket.fechaLimiteSla)}
                    </span>
                    {slaVencido(ticket) && (
                      <small className="text-danger">Vencido</small>
                    )}
                  </>
                ) : (
                  'Sin SLA'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
