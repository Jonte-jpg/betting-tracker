// src/lib/storage.ts
export const STORAGE_KEY = 'betting-tracker:v1'
export const STORAGE_VERSION = 1

export function safeParse<T>(raw: string): T | undefined {
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}