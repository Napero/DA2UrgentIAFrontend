import { useCallback, useEffect, useState } from 'react'

export function useResource<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
) {
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState<{
    key: string
    load?: typeof load
    data?: T
    error?: Error
  }>({
    key: '',
  })
  const requestKey = key + ':' + revision
  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve()
      .then(() => load(controller.signal))
      .then(
        (data) => {
          if (!controller.signal.aborted)
            setState({ key: requestKey, load, data })
        },
        (error) => {
          if (!controller.signal.aborted)
            setState({
              key: requestKey,
              load,
              error:
                error instanceof Error
                  ? error
                  : new Error('No se pudo cargar la información.'),
            })
        },
      )
    return () => controller.abort()
  }, [requestKey, load])

  return {
    data:
      state.key === requestKey && state.load === load ? state.data : undefined,
    error:
      state.key === requestKey && state.load === load ? state.error : undefined,
    loading: state.key !== requestKey || state.load !== load,
    reload,
  }
}
