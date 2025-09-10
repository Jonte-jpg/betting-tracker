declare module '@tauri-apps/api/fs' {
  export enum BaseDirectory { Download }
  export function writeTextFile(path: string, contents: string, options?: { dir?: BaseDirectory }): Promise<void>
  export function readTextFile(path: string): Promise<string>
  export function exists(path: string, options?: { dir?: BaseDirectory }): Promise<boolean>
  export function createDir(path: string, options?: { dir?: BaseDirectory; recursive?: boolean }): Promise<void>
}

declare module '@tauri-apps/api/dialog' {
  export function open(options?: { multiple?: boolean; filters?: { name: string; extensions: string[] }[] }): Promise<string | string[] | null>
}
