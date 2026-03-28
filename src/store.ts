import { AppState, createDefaultState } from './types'

export type Listener = () => void

const MAX_UNDO = 50

class Store {
  private state: AppState
  private listeners: Set<Listener> = new Set()
  private undoStack: AppState[] = []
  private redoStack: AppState[] = []

  constructor(initial: AppState) {
    this.state = initial
  }

  get(): AppState {
    return this.state
  }

  /** Update state and notify listeners. Set `pushUndo` to record in undo history. */
  set(partial: Partial<AppState>, pushUndo = false): void {
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    this.state = { ...this.state, ...partial }
    this.notify()
  }

  /** Deep-merge for nested axes / quadrants updates */
  patch(path: 'axes.x' | 'axes.y', value: Partial<AppState['axes']['x']>, pushUndo?: boolean): void
  patch(path: string, value: unknown, pushUndo = false): void {
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    const keys = path.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any = this.state
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]!]
    }
    const lastKey = keys[keys.length - 1]!
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      target[lastKey] = { ...target[lastKey], ...value }
    } else {
      target[lastKey] = value
    }
    this.notify()
  }

  updateElement(id: string, updates: Partial<AppState['elements'][number]>, pushUndo = false): void {
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    this.state = {
      ...this.state,
      elements: this.state.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }
    this.notify()
  }

  addElement(el: AppState['elements'][number], pushUndo = true): void {
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    this.state = {
      ...this.state,
      elements: [...this.state.elements, el],
    }
    this.notify()
  }

  removeElement(id: string, pushUndo = true): void {
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    this.state = {
      ...this.state,
      elements: this.state.elements.filter(el => el.id !== id),
      selectedId: this.state.selectedId === id ? null : this.state.selectedId,
    }
    this.notify()
  }

  moveElementLayer(id: string, direction: 'up' | 'down', pushUndo = true): void {
    const idx = this.state.elements.findIndex(el => el.id === id)
    if (idx < 0) return
    const arr = [...this.state.elements]
    const target = direction === 'up' ? idx + 1 : idx - 1
    if (target < 0 || target >= arr.length) return
    if (pushUndo) {
      this.undoStack.push(structuredClone(this.state))
      if (this.undoStack.length > MAX_UNDO) this.undoStack.shift()
      this.redoStack.length = 0
    }
    ;[arr[idx], arr[target]] = [arr[target]!, arr[idx]!]
    this.state = { ...this.state, elements: arr }
    this.notify()
  }

  undo(): boolean {
    const prev = this.undoStack.pop()
    if (!prev) return false
    this.redoStack.push(structuredClone(this.state))
    this.state = prev
    this.notify()
    return true
  }

  redo(): boolean {
    const next = this.redoStack.pop()
    if (!next) return false
    this.undoStack.push(structuredClone(this.state))
    this.state = next
    this.notify()
    return true
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  /** Replace full state (for import / load) */
  load(state: AppState): void {
    this.undoStack.length = 0
    this.redoStack.length = 0
    this.state = state
    this.notify()
  }

  private notify(): void {
    for (const fn of this.listeners) fn()
  }
}

export const store = new Store(createDefaultState())
