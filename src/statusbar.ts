import { store } from './store'

export function renderStatusBar(): void {
  const { elements, selectedId, viewport } = store.get()

  document.getElementById('element-count')!.textContent = `${elements.length} 个元素`

  const selEl = elements.find(e => e.id === selectedId)
  document.getElementById('selected-info')!.textContent =
    selEl ? `选中: ${selEl.text}` : ''

  document.getElementById('zoom-level')!.textContent =
    `${Math.round(viewport.zoom * 100)}%`
}

export function initZoom(): void {
  document.getElementById('zoom-in')!.addEventListener('click', () => {
    const z = Math.min(3, store.get().viewport.zoom + 0.1)
    store.patch('viewport' as 'axes.x', { zoom: z } as never)
    applyZoom()
  })
  document.getElementById('zoom-out')!.addEventListener('click', () => {
    const z = Math.max(0.3, store.get().viewport.zoom - 0.1)
    store.patch('viewport' as 'axes.x', { zoom: z } as never)
    applyZoom()
  })
  document.getElementById('zoom-fit')!.addEventListener('click', () => {
    store.patch('viewport' as 'axes.x', { zoom: 1, panX: 0, panY: 0 } as never)
    applyZoom()
  })
}

function applyZoom(): void {
  const { viewport } = store.get()
  const canvas = document.getElementById('canvas')
  if (canvas) {
    canvas.style.transform = `scale(${viewport.zoom})`
    canvas.style.transformOrigin = 'center center'
  }
}
