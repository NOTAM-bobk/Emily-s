import { useEffect, useState } from 'react'

const memoryFallback = new Map()

function readStorage(key, initialValue) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initialValue
  } catch {
    return memoryFallback.has(key) ? memoryFallback.get(key) : initialValue
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    memoryFallback.set(key, value)
  }
}

/**
 * Persists state to localStorage under `key`, falling back to an in-memory
 * value if localStorage is unavailable (e.g. private browsing restrictions).
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue]
}
