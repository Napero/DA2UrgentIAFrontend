import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AppConSesion } from './app/AppConSesion'
import { AutenticacionProvider } from './shared/session/AutenticacionProvider'
import './app/layout/layout.css'
import './shared/ui/datos.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AutenticacionProvider>
      <AppConSesion />
    </AutenticacionProvider>
  </StrictMode>,
)
