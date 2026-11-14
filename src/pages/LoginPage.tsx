import { useEffect } from 'react'
import { Link } from 'react-router'
import { EstadoVacio } from '../shared/ui/EstadoVacio'

export function LoginPage() {
  useEffect(() => {
    document.title = 'Iniciar sesión · UrgentIA'
  }, [])
  return (
    <main className="login-shell">
      <Link to="/" className="login-brand">
        <img src="/favicon.svg" alt="" width="48" height="48" />
        UrgentIA
      </Link>
      <h1>Iniciar sesión</h1>
      <section className="panel">
        <EstadoVacio
          titulo="Próximamente"
          descripcion="El acceso a tu cuenta estará disponible en esta sección."
          icono="usuarios"
          accion={
            <Link to="/" className="button button-secondary">
              Volver al inicio
            </Link>
          }
        />
      </section>
    </main>
  )
}
