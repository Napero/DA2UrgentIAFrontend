import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { InicioPage } from '../pages/InicioPage'
import { LoginPage } from '../pages/LoginPage'
import { NoEncontradoPage } from '../pages/NoEncontradoPage'
import { SeccionPendientePage } from '../pages/SeccionPendientePage'
import { secciones } from './navigation'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route index element={<InicioPage />} />
          {secciones.map((seccion) => (
            <Route
              key={seccion.ruta}
              path={seccion.ruta}
              element={<SeccionPendientePage seccion={seccion} />}
            />
          ))}
          <Route
            path="/tickets/:ticketId"
            element={
              <SeccionPendientePage
                seccion={{
                  titulo: 'Detalle del ticket',
                  descripcion:
                    'El seguimiento de una solicitud, de principio a fin.',
                  icono: 'ticket',
                }}
              />
            }
          />
          <Route path="*" element={<NoEncontradoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
