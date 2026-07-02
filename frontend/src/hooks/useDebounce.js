import { useCallback, useEffect, useRef } from 'react'

export function useDebouncedCallback(fn, delayMs) {
  const fnRef = useRef(fn)
  const handleRef = useRef(null)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  return useCallback(
    (...args) => {
      clearTimeout(handleRef.current)
      handleRef.current = setTimeout(() => fnRef.current(...args), delayMs)
    },
    [delayMs],
  )
}
