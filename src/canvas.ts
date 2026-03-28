import { store } from './store'
import { QuadElement, ElementKind, generateId } from './types'

const CANVAS_W = 680
const CANVAS_H = 620
const PAD = { top: 40, right: 30, bottom: 50, left: 60 }

function colorWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function buildElementDOM(el: QuadElement): HTMLElement {
  const div = document.createElement('div')
  div.dataset.id = el.id
  div.classList.add('canvas-element')
  if (!el.visible) div.classList.add('hidden')
  div.style.left = `${el.x}px`
  div.style.top = `${el.y}px`
  div.style.opacity = String(el.opacity)
  div.style.zIndex = String(el.zIndex)
  div.style.fontSize = `${el.fontSize}px`

  switch (el.kind) {
    case 'card':
      div.classList.add('card-element')
      div.style.borderColor = colorWithAlpha(el.color, 0.4)
      div.innerHTML = `<span class="card-emoji">${el.emoji}</span>${el.text}`
      break
    case 'tag':
      div.classList.add('tag-element')
      div.style.background = colorWithAlpha(el.color, 0.1)
      div.style.color = el.color
      div.style.borderColor = colorWithAlpha(el.color, 0.35)
      div.textContent = `${el.emoji} ${el.text}`
      break
    case 'icon':
      div.classList.add('icon-element')
      div.style.background = colorWithAlpha(el.color, 0.1)
      div.style.borderColor = colorWithAlpha(el.color, 0.25)
      div.textContent = el.emoji
      break
    case 'text':
      div.style.color = el.color
      div.style.padding = '4px 8px'
      div.style.background = 'rgba(255,255,255,.03)'
      div.style.border = '1px solid var(--border)'
      div.style.borderRadius = '6px'
      div.textContent = `${el.emoji} ${el.text}`
      break
  }

  return div
}

function getQuadrant(x: number, y: number): string {
  const midX = PAD.left + (CANVAS_W - PAD.left - PAD.right) / 2
  const midY = PAD.top + (CANVAS_H - PAD.top - PAD.bottom) / 2
  if (x >= midX && y < midY) return 'Q1'
  if (x < midX && y < midY) return 'Q2'
  if (x < midX && y >= midY) return 'Q3'
  return 'Q4'
}

export function getElementQuadrant(el: QuadElement): string {
  return getQuadrant(el.x + 40, el.y + 15)
}

/* ── Drag state ── */
let dragging: HTMLElement | null = null
let dragId = ''
let offsetX = 0
let offsetY = 0

function onMouseDown(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest('.canvas-element') as HTMLElement | null
  if (!target?.dataset.id) return

  e.preventDefault()
  store.set({ selectedId: target.dataset.id })

  dragging = target
  dragId = target.dataset.id
  const rect = target.getBoundingClientRect()
  offsetX = e.clientX - rect.left
  offsetY = e.clientY - rect.top

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent): void {
  if (!dragging) return
  const canvas = document.getElementById('canvas')!
  const cr = canvas.getBoundingClientRect()
  let nx = e.clientX - cr.left - offsetX
  let ny = e.clientY - cr.top - offsetY
  nx = Math.max(0, Math.min(nx, cr.width - dragging.offsetWidth))
  ny = Math.max(0, Math.min(ny, cr.height - dragging.offsetHeight))
  dragging.style.left = `${nx}px`
  dragging.style.top = `${ny}px`
}

function onMouseUp(): void {
  if (dragging) {
    const x = parseFloat(dragging.style.left)
    const y = parseFloat(dragging.style.top)
    store.updateElement(dragId, { x, y }, true)
  }
  dragging = null
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

function defaultKindForTool(tool: string): ElementKind {
  if (tool === 'card' || tool === 'rect') return 'card'
  if (tool === 'icon' || tool === 'circle') return 'icon'
  if (tool === 'text') return 'text'
  return 'tag'
}

function onCanvasDblClick(e: MouseEvent): void {
  const canvas = document.getElementById('canvas')!
  const cr = canvas.getBoundingClientRect()
  const x = e.clientX - cr.left
  const y = e.clientY - cr.top
  if (x < 0 || y < 0 || x > CANVAS_W || y > CANVAS_H) return

  const state = store.get()
  const kind = defaultKindForTool(state.activeTool)
  const maxZ = state.elements.reduce((m, el) => Math.max(m, el.zIndex), 0)
  const newEl: QuadElement = {
    id: generateId(),
    kind,
    text: '新元素',
    emoji: kind === 'card' ? '📝' : kind === 'icon' ? '⭐' : kind === 'tag' ? '🏷' : '✏️',
    x: x - 30,
    y: y - 15,
    color: '#e8c97d',
    fontSize: kind === 'icon' ? 18 : 12,
    opacity: 0.9,
    visible: true,
    zIndex: maxZ + 1,
  }
  store.addElement(newEl)
  store.set({ selectedId: newEl.id })
}

function onCanvasClick(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest('.canvas-element')
  if (!target) {
    store.set({ selectedId: null })
  }
}

/* ── Render ── */
export function renderCanvas(): void {
  const container = document.getElementById('elements-container')!
  const state = store.get()

  container.innerHTML = ''
  for (const el of state.elements) {
    const dom = buildElementDOM(el)
    if (state.selectedId === el.id) dom.classList.add('selected')
    container.appendChild(dom)
  }
}

export function renderAxisLabels(): void {
  const { axes, quadrants } = store.get()

  const $ = (id: string) => document.getElementById(id)!

  $('x-title-label').textContent = axes.x.title
  $('x-min-label-display').textContent = `← ${axes.x.minLabel}`
  $('x-max-label-display').textContent = `${axes.x.maxLabel} →`

  $('y-title-label').textContent = axes.y.title
  $('y-min-label-display').textContent = `↓ ${axes.y.minLabel}`
  $('y-max-label-display').textContent = `↑ ${axes.y.maxLabel}`

  $('q1-label').textContent = `Ⅰ ${quadrants[0].name}`
  $('q2-label').textContent = `Ⅱ ${quadrants[1].name}`
  $('q3-label').textContent = `Ⅲ ${quadrants[2].name}`
  $('q4-label').textContent = `Ⅳ ${quadrants[3].name}`
}

export function initCanvas(): void {
  const container = document.getElementById('elements-container')!
  container.addEventListener('mousedown', onMouseDown)

  const canvasOuter = document.getElementById('canvas-outer')!
  canvasOuter.addEventListener('dblclick', onCanvasDblClick)
  canvasOuter.addEventListener('click', onCanvasClick)
}
