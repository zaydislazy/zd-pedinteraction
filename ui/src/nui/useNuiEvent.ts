import { useEffect, useRef } from 'react'
import type { NuiMessage } from '../types/dialogue'

export function useNuiEvent<T>(action: NuiMessage['action'], handler: (data: T) => void) {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: MessageEvent<NuiMessage<T>>) => {
      if (event.data?.action !== action) return
      handlerRef.current(event.data.data as T)
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action])
}
