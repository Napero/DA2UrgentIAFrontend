import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export function opcion<T extends string>(
  valor: string | null,
  opciones: Record<T, string>,
): T | undefined {
  return valor && Object.hasOwn(opciones, valor) ? (valor as T) : undefined
}
export function useFiltros() {
  const [params, setParams] = useSearchParams()
  const numero = Number(params.get('page') ?? 0)
  const page =
    Number.isInteger(numero) && numero >= 0 && numero <= 2147483647 ? numero : 0
  const rawSize = Number(params.get('size') ?? 20)
  const size = [20, 50, 100].includes(rawSize) ? rawSize : 20
  const actualizar = useCallback(
    (valores: Record<string, string | number | undefined>) => {
      setParams((actual) => {
        const siguiente = new URLSearchParams(actual)
        if (!Object.hasOwn(valores, 'page')) siguiente.delete('page')
        for (const [key, value] of Object.entries(valores)) {
          if (value === undefined || value === '') siguiente.delete(key)
          else siguiente.set(key, String(value))
        }
        return siguiente
      })
    },
    [setParams],
  )
  return { params, page, size, actualizar }
}
