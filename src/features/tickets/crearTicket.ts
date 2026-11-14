// Largos de contracts/ticket-service.yaml (CrearTicketRequest, sección 8.4 del contexto).
// Los tipos generados no traen minLength ni maxLength, por eso se repiten acá.
export const LIMITES = {
  titulo: { min: 5, max: 120 },
  descripcion: { min: 10, max: 2000 },
} as const

export type Campo = keyof typeof LIMITES
export type ErroresCampo = Partial<Record<Campo, string>>

export function validarTicket(valores: Record<Campo, string>): ErroresCampo {
  const errores: ErroresCampo = {}
  for (const campo of Object.keys(LIMITES) as Campo[]) {
    const largo = valores[campo].trim().length
    const { min, max } = LIMITES[campo]
    if (largo === 0) errores[campo] = 'Completá este campo.'
    else if (largo < min) errores[campo] = `Escribí al menos ${min} caracteres.`
    else if (largo > max) errores[campo] = `Usá como máximo ${max} caracteres.`
  }
  return errores
}
