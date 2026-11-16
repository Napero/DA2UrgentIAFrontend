export interface DetalleError {
  campo: string
  mensaje: string
}

export class ApiError extends Error {
  readonly tipo: 'http' | 'red' | 'timeout' | 'respuesta'
  readonly status: number | null
  readonly codigo?: string
  readonly correlationId?: string
  readonly detalles: DetalleError[]

  constructor(
    mensaje: string,
    opciones: {
      tipo: ApiError['tipo']
      status?: number
      codigo?: string
      correlationId?: string
      detalles?: DetalleError[]
      cause?: unknown
    },
  ) {
    super(mensaje, { cause: opciones.cause })
    this.name = 'ApiError'
    this.tipo = opciones.tipo
    this.status = opciones.status ?? null
    this.codigo = opciones.codigo
    this.correlationId = opciones.correlationId
    this.detalles = opciones.detalles ?? []
  }
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null
}

export function errorHttp(response: Response, body: unknown): ApiError {
  const datos = esObjeto(body) ? body : {}
  const detalles = Array.isArray(datos.detalles)
    ? datos.detalles.filter(
        (detalle): detalle is DetalleError =>
          esObjeto(detalle) &&
          typeof detalle.campo === 'string' &&
          typeof detalle.mensaje === 'string',
      )
    : []

  return new ApiError(
    typeof datos.mensaje === 'string'
      ? datos.mensaje
      : 'No pudimos completar la solicitud.',
    {
      tipo: 'http',
      status: response.status,
      codigo: typeof datos.codigo === 'string' ? datos.codigo : undefined,
      correlationId:
        typeof datos.correlationId === 'string'
          ? datos.correlationId
          : (response.headers.get('X-Correlation-Id') ?? undefined),
      detalles,
    },
  )
}
