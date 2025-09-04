import { ReactNode } from 'react'

export function Container({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
}