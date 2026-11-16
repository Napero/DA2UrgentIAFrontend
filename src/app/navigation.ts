import type { NombreIcono } from '../shared/ui/Icono'

export interface Seccion {
  ruta: string
  titulo: string
  descripcion: string
  icono: NombreIcono
}

export const secciones: Seccion[] = [
  {
    ruta: '/tickets',
    titulo: 'Bandeja de tickets',
    descripcion:
      'Organizá la atención y encontrá las solicitudes que necesitan una respuesta.',
    icono: 'ticket',
  },
  {
    ruta: '/mis-tickets',
    titulo: 'Mis tickets',
    descripcion: 'Seguí el avance de tus solicitudes en un solo lugar.',
    icono: 'propios',
  },
  {
    ruta: '/reportes',
    titulo: 'Reportes',
    descripcion:
      'Una mirada a la atención, las prioridades y los tiempos de resolución.',
    icono: 'reportes',
  },
  {
    ruta: '/notificaciones',
    titulo: 'Notificaciones',
    descripcion:
      'Las novedades de la atención y el seguimiento de los tickets.',
    icono: 'notificaciones',
  },
  {
    ruta: '/usuarios',
    titulo: 'Usuarios',
    descripcion:
      'Administrá las personas que forman parte de la mesa de ayuda.',
    icono: 'usuarios',
  },
  {
    ruta: '/tickets/nuevo',
    titulo: 'Crear ticket',
    descripcion: 'Contanos qué pasó para que podamos ayudarte.',
    icono: 'mas',
  },
]

export const navegacion = [
  { ruta: '/', titulo: 'Inicio', icono: 'inicio' as const },
  ...secciones.filter((seccion) => seccion.ruta !== '/tickets/nuevo'),
]
