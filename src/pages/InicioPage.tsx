import { Link } from 'react-router'
import { Icono, type NombreIcono } from '../shared/ui/Icono'

const accesos: {
  ruta: string
  titulo: string
  descripcion: string
  icono: NombreIcono
  etiqueta: string
}[] = [
  {
    ruta: '/tickets',
    titulo: 'Bandeja de tickets',
    descripcion: 'Encontrá cada solicitud y organizá su atención.',
    icono: 'ticket',
    etiqueta: 'Ver bandeja',
  },
  {
    ruta: '/reportes',
    titulo: 'Reportes y SLA',
    descripcion: 'Seguí las prioridades y los tiempos de respuesta.',
    icono: 'reportes',
    etiqueta: 'Ver reportes',
  },
  {
    ruta: '/notificaciones',
    titulo: 'Notificaciones',
    descripcion: 'Mantenete al tanto de las novedades de los tickets.',
    icono: 'notificaciones',
    etiqueta: 'Ver novedades',
  },
]

export function InicioPage() {
  return (
    <>
      <section className="hero" aria-labelledby="inicio-titulo">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-dot" /> SOPORTE QUE ACOMPAÑA
          </p>
          <h1 id="inicio-titulo">
            Tu mesa de ayuda,
            <br />
            <span>en un solo lugar.</span>
          </h1>
          <p className="hero-description">
            De la primera consulta a la resolución. Organizá las solicitudes y
            dale seguimiento a lo que importa.
          </p>
          <Link to="/tickets/nuevo" className="button button-primary">
            <Icono nombre="mas" size={18} /> Crear un ticket
          </Link>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="orbit orbit-outer" />
          <div className="orbit orbit-inner" />
          <div className="illustration-center">
            <Icono nombre="ticket" size={56} />
          </div>
          <span className="illustration-chip chip-top">
            <Icono nombre="listo" size={18} /> Todo en su lugar
          </span>
          <span className="illustration-chip chip-bottom">
            <Icono nombre="reloj" size={18} /> Cada paso, más claro
          </span>
          <span className="orbit-dot dot-one" />
          <span className="orbit-dot dot-two" />
        </div>
      </section>
      <section aria-labelledby="accesos-titulo" className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TU ESPACIO</p>
            <h2 id="accesos-titulo">Todo a mano</h2>
          </div>
          <p>Un lugar para cada parte de la atención.</p>
        </div>
        <div className="access-grid">
          {accesos.map((acceso) => (
            <Link to={acceso.ruta} key={acceso.ruta} className="access-card">
              <span className="access-icon">
                <Icono nombre={acceso.icono} size={24} />
              </span>
              <h3>{acceso.titulo}</h3>
              <p>{acceso.descripcion}</p>
              <span className="card-link">
                {acceso.etiqueta}
                <Icono nombre="flecha" size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="journey section-block"
        aria-labelledby="recorrido-titulo"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">ASÍ FUNCIONA</p>
            <h2 id="recorrido-titulo">De la consulta a la solución</h2>
          </div>
        </div>
        <ol className="journey-steps">
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Contanos qué pasó</h3>
              <p>Creá un ticket con el detalle de tu solicitud.</p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Encontramos su prioridad</h3>
              <p>Cada caso se clasifica para orientar la atención.</p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Seguimos cada avance</h3>
              <p>El equipo acompaña el ticket hasta resolverlo.</p>
            </div>
          </li>
        </ol>
      </section>
    </>
  )
}
