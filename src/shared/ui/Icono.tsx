const trazos = {
  inicio: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  ticket: 'M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6Zm9 3v2m0 2v2m0 2v2',
  propios:
    'M8 4H5a1 1 0 0 0-1 1v15h16V5a1 1 0 0 0-1-1h-3M8 3h8v4H8Zm0 9h8m-8 4h5',
  reportes: 'M4 3v17h17M8 16v-5m5 5V6m5 10V9',
  notificaciones: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4',
  usuarios:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m7-7.87a4 4 0 0 1 0 7.75',
  flecha: 'M5 12h14m-6-6 6 6-6 6',
  mas: 'M12 5v14M5 12h14',
  menu: 'M4 6h16M4 12h16M4 18h16',
  cerrar: 'm6 6 12 12M6 18 18 6',
  alerta: 'm12 3 10 18H2Zm0 6v4m0 4h.01',
  reloj: 'M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  listo: 'm7 12 3 3 7-7m4 4a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
} as const

export type NombreIcono = keyof typeof trazos

export function Icono({
  nombre,
  size = 20,
}: {
  nombre: NombreIcono
  size?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={trazos[nombre]} />
    </svg>
  )
}
