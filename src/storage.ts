import { store } from './store'
import { AppState, SCHEMA_VERSION, createDefaultState } from './types'

const STORAGE_KEY = 'codo-quadrant-state'
let saveTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store.get()))
    } catch { /* quota exceeded — silent */ }
  }, 400)
}

export function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed: AppState = JSON.parse(raw)
    if (parsed.version === SCHEMA_VERSION) {
      store.load(parsed)
    }
  } catch { /* corrupt data — use default */ }
}

export function exportJSON(): void {
  const blob = new Blob([JSON.stringify(store.get(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quadrant-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data: AppState = JSON.parse(reader.result as string)
        if (data.version === SCHEMA_VERSION) {
          store.load(data)
        } else {
          alert('不兼容的文件版本')
        }
      } catch {
        alert('文件格式错误')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

export function initStorage(): void {
  loadFromStorage()
  store.subscribe(scheduleSave)
}

export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
  store.load(createDefaultState())
}
