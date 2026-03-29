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

export function applyZoom(): void {
  const { viewport } = store.get()
  const canvas = document.getElementById('canvas')
  if (canvas) {
    canvas.style.transform = `scale(${viewport.zoom})`
    canvas.style.transformOrigin = 'center center'
  }
}

export function initZoom(): void {
  const zoomBy = (delta: number) => {
    const z = Math.min(3, Math.max(0.25, store.get().viewport.zoom + delta))
    store.patchViewport({ zoom: z })
    applyZoom()
  }

  document.getElementById('zoom-in')!.addEventListener('click', () => zoomBy(0.1))
  document.getElementById('zoom-out')!.addEventListener('click', () => zoomBy(-0.1))
  document.getElementById('zoom-fit')!.addEventListener('click', () => {
    store.patchViewport({ zoom: 1, panX: 0, panY: 0 })
    applyZoom()
  })

  const outer = document.getElementById('canvas-outer')!
  outer.addEventListener('wheel', (e) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 0.06 : -0.06
    zoomBy(delta)
  }, { passive: false })
}
