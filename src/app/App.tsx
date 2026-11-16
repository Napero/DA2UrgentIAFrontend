import { BrowserRouter, Route, Routes } from 'react-router'
import { AppLayout } from './layout/AppLayout'
import { InicioPage } from '../pages/InicioPage'
import { LoginPage } from '../pages/LoginPage'
import { NoEncontradoPage } from '../pages/NoEncontradoPage'
import {
  SesionProvider,
  type SesionProviderProps,
} from '../shared/session/SesionProvider'
import { RequiereRol } from '../shared/session/RequiereRol'
import { BandejaPage } from '../features/tickets/BandejaPage'
import { DetallePage } from '../features/tickets/DetallePage'
import { CrearTicketPage } from '../features/tickets/CrearTicketPage'
import { MisTicketsPage } from '../features/tickets/MisTicketsPage'
import { MiTicketPage } from '../features/tickets/MiTicketPage'
import { UsuariosPage } from '../features/usuarios/UsuariosPage'
import { ReportesPage } from '../features/reportes/ReportesPage'
import { NotificacionesPage } from '../features/notificaciones/NotificacionesPage'

export type AppProps = Omit<SesionProviderProps, 'children'>

// P3 conecta su estado de sesión y callbacks con estas props, sin duplicar clientes.
export function App(props: AppProps) {
  return (
    <SesionProvider {...props}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route index element={<InicioPage />} />
            <Route
              path="/tickets"
              element={
                <RequiereRol roles={['AGENTE', 'ADMIN']}>
                  <BandejaPage />
                </RequiereRol>
              }
            />
            <Route
              path="/tickets/nuevo"
              element={
                <RequiereRol roles={['SOLICITANTE', 'AGENTE', 'ADMIN']}>
                  <CrearTicketPage />
                </RequiereRol>
              }
            />
            <Route
              path="/tickets/:ticketId"
              element={
                <RequiereRol roles={['AGENTE', 'ADMIN']}>
                  <DetallePage />
                </RequiereRol>
              }
            />
            <Route
              path="/mis-tickets"
              element={
                <RequiereRol roles={['SOLICITANTE']}>
                  <MisTicketsPage />
                </RequiereRol>
              }
            />
            <Route
              path="/mis-tickets/:ticketId"
              element={
                <RequiereRol roles={['SOLICITANTE']}>
                  <MiTicketPage />
                </RequiereRol>
              }
            />
            <Route
              path="/reportes"
              element={
                <RequiereRol roles={['AGENTE', 'ADMIN']}>
                  <ReportesPage />
                </RequiereRol>
              }
            />
            <Route
              path="/notificaciones"
              element={
                <RequiereRol roles={['AGENTE', 'ADMIN']}>
                  <NotificacionesPage />
                </RequiereRol>
              }
            />
            <Route
              path="/usuarios"
              element={
                <RequiereRol roles={['ADMIN']}>
                  <UsuariosPage />
                </RequiereRol>
              }
            />
            <Route path="*" element={<NoEncontradoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  )
}
