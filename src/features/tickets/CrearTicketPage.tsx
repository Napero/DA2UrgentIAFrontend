import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { ApiError } from '../../shared/api'
import type { Ticket } from '../../shared/api/types'
import { useServicios, useSesion } from '../../shared/session/context'
import { PageHeader } from '../../shared/ui/Datos'
import { BadgeEstado, BadgePrioridad } from './TicketsUi'
import { estaPendiente, fecha } from './model'
import {
  LIMITES,
  validarTicket,
  type Campo,
  type ErroresCampo,
} from './crearTicket'
import './crear-ticket.css'

function esCampo(valor: string): valor is Campo {
  return valor in LIMITES
}

export function CrearTicketPage() {
  const servicios = useServicios()
  const { sesion } = useSesion()
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState<ErroresCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [creado, setCreado] = useState<Ticket | null>(null)
  const tituloResultado = useRef<HTMLHeadingElement>(null)

  // Al crear, el foco va al resultado para que los lectores de pantalla lo anuncien.
  useEffect(() => {
    if (creado) tituloResultado.current?.focus()
  }, [creado])

  const enviar = async (event: FormEvent) => {
    event.preventDefault()
    if (enviando) return
    const valores = { titulo, descripcion }
    const locales = validarTicket(valores)
    setErrores(locales)
    setErrorGeneral(null)
    if (Object.keys(locales).length) return
    setEnviando(true)
    try {
      setCreado(
        await servicios.crearTicket({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
        }),
      )
    } catch (causa) {
      if (causa instanceof ApiError && causa.status === 400) {
        const delServidor: ErroresCampo = {}
        for (const detalle of causa.detalles)
          if (esCampo(detalle.campo))
            delServidor[detalle.campo] = detalle.mensaje
        setErrores(delServidor)
        setErrorGeneral(causa.message)
      } else if (
        causa instanceof ApiError &&
        (causa.tipo === 'red' || causa.tipo === 'timeout')
      ) {
        setErrorGeneral(
          causa.message +
            ' Puede que el ticket se haya creado igual: revisá tus tickets antes de volver a enviarlo.',
        )
      } else {
        setErrorGeneral(
          causa instanceof Error
            ? causa.message
            : 'No pudimos crear el ticket. Intentá nuevamente.',
        )
      }
    } finally {
      setEnviando(false)
    }
  }

  const crearOtro = () => {
    setCreado(null)
    setTitulo('')
    setDescripcion('')
    setErrores({})
    setErrorGeneral(null)
  }

  if (creado) {
    const pendiente = estaPendiente(creado)
    const esSolicitante = sesion?.usuario.rol === 'SOLICITANTE'
    return (
      <>
        <PageHeader
          titulo="Crear ticket"
          descripcion="Contanos qué pasó para que podamos ayudarte."
        />
        <section
          className="panel detail-summary"
          aria-labelledby="ticket-creado"
        >
          <p className="eyebrow">TICKET CREADO</p>
          <h2 id="ticket-creado" ref={tituloResultado} tabIndex={-1}>
            {creado.titulo}
          </h2>
          <div className="detail-badges">
            <BadgeEstado estado={creado.estado} />
            <BadgePrioridad prioridad={creado.prioridad} />
          </div>
          {pendiente ? (
            <p className="notice" role="status">
              Estamos analizando tu ticket. La prioridad y el plazo de
              resolución aparecen cuando termine la clasificación.
            </p>
          ) : (
            <dl className="detail-grid">
              <div>
                <dt>Plazo de resolución</dt>
                <dd>{fecha(creado.fechaLimiteSla)}</dd>
              </div>
              {creado.motivoEscalamiento && (
                <div>
                  <dt>Derivado a la guardia</dt>
                  <dd>{creado.motivoEscalamiento}</dd>
                </div>
              )}
            </dl>
          )}
          <div className="crear-acciones">
            {esSolicitante ? (
              <Link to="/mis-tickets" className="button button-primary">
                Ver mis tickets
              </Link>
            ) : (
              <Link
                to={'/tickets/' + encodeURIComponent(creado.id)}
                className="button button-primary"
              >
                Ver el detalle
              </Link>
            )}
            <button
              type="button"
              className="button button-secondary"
              onClick={crearOtro}
            >
              Crear otro ticket
            </button>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHeader
        titulo="Crear ticket"
        descripcion="Contanos qué pasó para que podamos ayudarte."
      />
      <section className="panel crear-panel">
        <form className="crear-form" onSubmit={enviar} noValidate>
          {errorGeneral && (
            <p className="notice warning" role="alert">
              {errorGeneral}
            </p>
          )}
          <label>
            Título
            <input
              name="titulo"
              value={titulo}
              maxLength={LIMITES.titulo.max}
              onChange={(event) => setTitulo(event.target.value)}
              disabled={enviando}
              aria-invalid={Boolean(errores.titulo)}
              aria-describedby="titulo-ayuda"
            />
            <span id="titulo-ayuda" className="crear-ayuda">
              {errores.titulo ? (
                <span className="crear-error">{errores.titulo}</span>
              ) : (
                'Un resumen corto del problema.'
              )}
              <span aria-hidden="true">
                {titulo.length}/{LIMITES.titulo.max}
              </span>
            </span>
          </label>
          <label>
            Descripción
            <textarea
              name="descripcion"
              value={descripcion}
              maxLength={LIMITES.descripcion.max}
              onChange={(event) => setDescripcion(event.target.value)}
              disabled={enviando}
              aria-invalid={Boolean(errores.descripcion)}
              aria-describedby="descripcion-ayuda"
            />
            <span id="descripcion-ayuda" className="crear-ayuda">
              {errores.descripcion ? (
                <span className="crear-error">{errores.descripcion}</span>
              ) : (
                'Qué pasó, desde cuándo y a quién afecta.'
              )}
              <span aria-hidden="true">
                {descripcion.length}/{LIMITES.descripcion.max}
              </span>
            </span>
          </label>
          <button
            type="submit"
            className="button button-primary"
            disabled={enviando}
          >
            {enviando ? 'Creando…' : 'Crear ticket'}
          </button>
        </form>
      </section>
    </>
  )
}
