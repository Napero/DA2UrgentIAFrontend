import { ApiError, errorHttp } from './errors.ts'

export interface ApiClientOptions {
  getAccessToken?: () => string | null | undefined
  onUnauthorized?: () => void
  timeoutMs?: number
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  query?: Record<string, string | number | boolean | null | undefined>
}

export class ApiClient {
  private readonly baseUrl: string
  private readonly options: ApiClientOptions
  private readonly timeoutMs: number

  constructor(baseUrl: string, options: ApiClientOptions = {}) {
    const url = new URL(baseUrl)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        'VITE_API_URL debe ser una URL HTTP o HTTPS sin credenciales, query ni fragmento.',
      )
    }
    this.baseUrl = url.href.replace(/\/$/, '')
    this.options = options
    this.timeoutMs = options.timeoutMs ?? 15_000
    if (!Number.isInteger(this.timeoutMs) || this.timeoutMs <= 0) {
      throw new Error('El timeout debe ser un entero mayor que cero.')
    }
  }

  async request<T = unknown>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
      throw new Error('La ruta debe comenzar con / y pertenecer al gateway.')
    }

    const { query, body, ...init } = options
    const url = new URL(this.baseUrl + path)
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null)
        url.searchParams.set(key, String(value))
    }

    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')
    if (!headers.has('X-Correlation-Id'))
      headers.set('X-Correlation-Id', crypto.randomUUID())
    const token = this.options.getAccessToken?.()
    if (token) headers.set('Authorization', 'Bearer ' + token)
    if (body !== undefined) headers.set('Content-Type', 'application/json')

    const timeout = AbortSignal.timeout(this.timeoutMs)
    const signal = init.signal
      ? AbortSignal.any([init.signal, timeout])
      : timeout
    let response: Response
    let text: string
    try {
      response = await fetch(url, {
        ...init,
        headers,
        signal,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      text = response.status === 204 ? '' : await response.text()
    } catch (cause) {
      if (init.signal?.aborted) throw cause
      throw new ApiError(
        timeout.aborted
          ? 'La solicitud tardó demasiado. Intentá nuevamente.'
          : 'No pudimos conectarnos. Revisá tu conexión e intentá nuevamente.',
        { tipo: timeout.aborted ? 'timeout' : 'red', cause },
      )
    }

    // El callback lo conecta P3 con su sesión. No se guardan tokens ni se navega acá.
    if (response.status === 401) this.options.onUnauthorized?.()

    let data: unknown
    if (text) {
      try {
        data = JSON.parse(text)
      } catch (cause) {
        if (response.ok) {
          throw new ApiError(
            'El servidor devolvió una respuesta que no pudimos interpretar.',
            {
              tipo: 'respuesta',
              status: response.status,
              correlationId:
                response.headers.get('X-Correlation-Id') ?? undefined,
              cause,
            },
          )
        }
      }
    }
    if (!response.ok) throw errorHttp(response, data)
    return data as T
  }
}
