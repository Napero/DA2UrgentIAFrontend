import { ApiClient, type ApiClientOptions } from './client'
export { ApiClient } from './client'
export { ApiError } from './errors'
export type { ApiClientOptions, RequestOptions } from './client'
export type { DetalleError } from './errors'

// La instancia se crea al integrar la sesión; la UI inicial no hace llamadas.
export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = import.meta.env.VITE_API_URL?.trim()
  if (!baseUrl) throw new Error('Falta configurar VITE_API_URL en .env.local.')
  return new ApiClient(baseUrl, options)
}
