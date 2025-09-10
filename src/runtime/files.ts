import { isTauri } from './env'

export async function saveTextFile(name: string, content: string) {
  if (isTauri) {
    const { writeTextFile, BaseDirectory, exists, createDir } = await import('@tauri-apps/api/fs')
    const hasDir = await exists('BettingTracker', { dir: BaseDirectory.Download })
    if (!hasDir) await createDir('BettingTracker', { dir: BaseDirectory.Download, recursive: true })
    await writeTextFile(`BettingTracker/${name}`, content, { dir: BaseDirectory.Download })
    return `Downloads/BettingTracker/${name}`
  } else {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = name
    a.click()
    return null
  }
}

export async function openTextFile(): Promise<string | null> {
  if (isTauri) {
    const { readTextFile } = await import('@tauri-apps/api/fs')
    const { open } = await import('@tauri-apps/api/dialog')
    const path = await open({ multiple: false, filters: [{ name: 'Data', extensions: ['csv', 'json', 'txt'] }] })
    if (!path || Array.isArray(path)) return null
    return await readTextFile(path)
  } else {
    return new Promise<string | null>((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.csv,.json,.txt'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) return resolve(null)
        resolve(await file.text())
      }
      input.click()
    })
  }
}
