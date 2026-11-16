import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { navegacion, secciones } from '../navigation'
import { Icono } from '../../shared/ui/Icono'
import { useSesion } from '../../shared/session/context'

export function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { sesion, onCerrarSesion } = useSesion()
  const menu = navegacion.filter(
    (item) =>
      item.ruta === '/' ||
      (sesion &&
        (item.ruta === '/usuarios'
          ? sesion.usuario.rol === 'ADMIN'
          : item.ruta === '/mis-tickets'
            ? sesion.usuario.rol === 'SOLICITANTE'
            : sesion.usuario.rol !== 'SOLICITANTE')),
  )
  const { pathname } = useLocation()
  const titulo =
    secciones.find((seccion) => seccion.ruta === pathname)?.titulo ??
    (pathname === '/'
      ? 'Inicio'
      : pathname.startsWith('/tickets/') || pathname.startsWith('/mis-tickets/')
        ? 'Detalle del ticket'
        : 'Página no encontrada')
  useEffect(() => {
    document.title = titulo + ' · UrgentIA'
  }, [titulo])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      <aside className="sidebar">
        <Link
          to="/"
          className="brand"
          aria-label="UrgentIA, inicio"
          onClick={() => setMenuAbierto(false)}
        >
          <img src="/favicon.svg" width="42" height="42" alt="" />
          <span>
            Urgent<span className="brand-accent">IA</span>
            <small>MESA DE AYUDA</small>
          </span>
        </Link>
        <button
          className="menu-toggle button button-secondary"
          aria-expanded={menuAbierto}
          aria-controls="navegacion-principal"
          onClick={() => setMenuAbierto(!menuAbierto)}
          type="button"
        >
          <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} />
          Menú
        </button>
        <nav
          id="navegacion-principal"
          className={'navigation ' + (menuAbierto ? 'navigation-open' : '')}
          aria-label="Navegación principal"
        >
          <p className="nav-label">ESPACIO DE TRABAJO</p>
          {menu.map((item) => (
            <NavLink
              to={item.ruta}
              key={item.ruta}
              end={item.ruta === '/'}
              className={({ isActive }) =>
                'nav-item ' + (isActive ? 'nav-item-active' : '')
              }
              onClick={() => setMenuAbierto(false)}
            >
              <Icono nombre={item.icono} />
              {item.titulo}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="small-dot" />
          Cada solicitud cuenta.
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Mesa de ayuda</span>
            <span aria-hidden="true">/</span>
            <strong>{titulo}</strong>
          </div>
          {sesion ? (
            <div className="session-user">
              <span>
                {sesion.usuario.nombre}
                <small>{sesion.usuario.rol}</small>
              </span>
              {onCerrarSesion && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={onCerrarSesion}
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          ) : (
            <Link className="session-link" to="/login">
              Iniciar sesión <Icono nombre="flecha" size={16} />
            </Link>
          )}
        </header>
        <main id="contenido" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="footer">
          <span>UrgentIA</span>
          <span>Atención con seguimiento.</span>
        </footer>
      </div>
    </div>
  )
}
