import type { ApiClient } from './client'
import type { components as Users } from './generated/user-service'

export type LoginRequest = Users['schemas']['LoginRequest']
export type LoginResponse = Users['schemas']['LoginResponse']

// Va con un cliente público, sin token ni callback de 401: un 401 acá son credenciales
// incorrectas y se muestra en el formulario, no es una sesión vencida.
export function pedirLogin(
  api: ApiClient,
  credenciales: LoginRequest,
  signal?: AbortSignal,
) {
  return api.request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: credenciales,
    signal,
  })
}
