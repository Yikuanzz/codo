import { store } from './store'
import { QuadElement, ElementKind, generateId } from './types'
import { getLucideSvg } from './icons'

const CANVAS_W = 680
const CANVAS_H = 620
const PAD = { top: 40, right: 30, bottom: 50, left: 60 }

function colorWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function iconSizeForKind(kind: ElementKind, fontSize: number): number {
  if (kind === 'icon') return Math.max(14, fontSize + 4)
  if (kind === 'card') return Math.max(14, fontSize + 4)
  return Math.max(12, fontSize + 2)
}

/** 将指针坐标换算为画布本地坐标（考虑 CSS transform: scale） */
function canvasLocalPoint(clientX: number, clientY: number): { x: number; y: number } {
  const canvas = document.getElementById('canvas')!
  const cr = canvas.getBoundingClientRect()
  const raw = getComputedStyle(canvas).transform
  const m = raw === 'none' || !raw ? new DOMMatrix() : new DOMMatrixReadOnly(raw)
  return new DOMPoint(clientX - cr.left, clientY - cr.top).matrixTransform(m.inverse())
}

function elementContentSig(el: QuadElement): string {
  return `${el.kind}|${el.text}|${el.iconName}|${el.color}|${el.fontSize}|${el.opacity}|${el.visible}`
}

function applyElementLayout(dom: HTMLElement, el: QuadElement): void {
  dom.style.left = `${el.x}px`
  dom.style.top = `${el.y}px`
  dom.style.opacity = String(el.opacity)
  dom.style.zIndex = String(el.zIndex)
  dom.style.fontSize = `${el.fontSize}px`
  dom.classList.toggle('hidden', !el.visible)
}

/** 填充元素内部（Lucide 图标 + 文案） */
function fillElementContent(div: HTMLElement, el: QuadElement): void {
  div.classList.remove('card-element', 'tag-element', 'icon-element')
  div.style.display = ''
  div.style.alignItems = ''
  div.style.gap = ''
  const stroke = el.color
  const iSz = iconSizeForKind(el.kind, el.fontSize)
  const svg = getLucideSvg(el.iconName || 'star', iSz, stroke)

  switch (el.kind) {
    case 'card': {
      div.classList.add('card-element')
      div.style.borderColor = colorWithAlpha(el.color, 0.4)
      div.replaceChildren()
      const wrap = document.createElement('span')
      wrap.className = 'card-ic'
      wrap.appendChild(svg)
      div.appendChild(wrap)
      div.appendChild(document.createTextNode(el.text))
      break
    }
    case 'tag': {
      div.classList.add('tag-element')
      div.style.background = colorWithAlpha(el.color, 0.1)
      div.style.color = el.color
      div.style.borderColor = colorWithAlpha(el.color, 0.35)
      div.replaceChildren()
      div.appendChild(svg)
      div.appendChild(document.createTextNode(` ${el.text}`))
      break
    }
    case 'icon': {
      div.classList.add('icon-element')
      div.style.background = colorWithAlpha(el.color, 0.1)
      div.style.borderColor = colorWithAlpha(el.color, 0.25)
      div.replaceChildren(svg)
      break
    }
    case 'text': {
      div.style.color = el.color
      div.style.padding = '4px 8px'
      div.style.background = 'rgba(255,255,255,.03)'
      div.style.border = '1px solid var(--border)'
      div.style.borderRadius = '6px'
      div.style.display = 'inline-flex'
      div.style.alignItems = 'center'
      div.style.gap = '4px'
      div.replaceChildren()
      div.appendChild(svg)
      div.appendChild(document.createTextNode(` ${el.text}`))
      break
    }
  }
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

let dragging: HTMLElement | null = null
let dragId = ''
let dragCtx: { startLocal: { x: number; y: number }; origin: { x: number; y: number } } | null = null
let didDrag = false
const DRAG_THRESHOLD = 3

function onMouseDown(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest('.canvas-element') as HTMLElement | null
  if (!target?.dataset.id) return

  e.preventDefault()
  e.stopPropagation()

  const el = store.get().elements.find(x => x.id === target.dataset.id)
  if (!el) return

  store.set({ selectedId: target.dataset.id })
  dragging = target
  dragId = target.dataset.id
  didDrag = false
  const loc = canvasLocalPoint(e.clientX, e.clientY)
  dragCtx = { startLocal: loc, origin: { x: el.x, y: el.y } }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent): void {
  if (!dragging || !dragCtx) return
  const loc = canvasLocalPoint(e.clientX, e.clientY)
  const dx = loc.x - dragCtx.startLocal.x
  const dy = loc.y - dragCtx.startLocal.y
  if (!didDrag && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
  didDrag = true
  let nx = dragCtx.origin.x + dx
  let ny = dragCtx.origin.y + dy
  nx = Math.max(0, Math.min(nx, CANVAS_W - dragging.offsetWidth))
  ny = Math.max(0, Math.min(ny, CANVAS_H - dragging.offsetHeight))
  dragging.style.left = `${nx}px`
  dragging.style.top = `${ny}px`
}

function onMouseUp(): void {
  if (dragging && dragCtx) {
    if (didDrag) {
      const x = parseFloat(dragging.style.left)
      const y = parseFloat(dragging.style.top)
      if (x !== dragCtx.origin.x || y !== dragCtx.origin.y) {
        store.updateElement(dragId, { x, y }, true)
      }
    }
  }
  dragging = null
  dragCtx = null
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

let activeInlineInput: HTMLInputElement | null = null

function closeInlineEdit(): void {
  if (activeInlineInput) {
    activeInlineInput.remove()
    activeInlineInput = null
  }
}

function openInlineEdit(elId: string, dom: HTMLElement): void {
  const el = store.get().elements.find(e => e.id === elId)
  if (!el || el.kind === 'icon') return
  closeInlineEdit()

  const input = document.createElement('input')
  input.type = 'text'
  input.value = el.text
  input.className = 'inline-edit-input'
  input.style.left = `${el.x}px`
  input.style.top = `${el.y}px`
  input.style.fontSize = `${el.fontSize}px`
  input.style.color = el.color
  input.style.zIndex = String(el.zIndex + 1000)
  input.style.minWidth = `${Math.max(dom.offsetWidth, 60)}px`

  const container = document.getElementById('elements-container')!
  container.appendChild(input)
  activeInlineInput = input
  requestAnimationFrame(() => { input.focus(); input.select() })

  const commit = () => {
    if (!activeInlineInput) return
    const newText = input.value.trim() || el.text
    if (newText !== el.text) {
      store.updateElement(elId, { text: newText }, true)
    }
    closeInlineEdit()
  }

  input.addEventListener('blur', commit)
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') { ev.preventDefault(); input.blur() }
    if (ev.key === 'Escape') { input.value = el.text; input.blur() }
    ev.stopPropagation()
  })
  input.addEventListener('mousedown', (ev) => ev.stopPropagation())
  input.addEventListener('click', (ev) => ev.stopPropagation())
}

function defaultKindForTool(tool: string): ElementKind {
  if (tool === 'card' || tool === 'rect') return 'card'
  if (tool === 'icon' || tool === 'circle') return 'icon'
  if (tool === 'text') return 'text'
  return 'tag'
}

function defaultIconForTool(tool: string, kind: ElementKind): string {
  if (tool === 'line') return 'target'
  switch (kind) {
    case 'card': return 'file-text'
    case 'icon': return 'star'
    case 'tag': return 'tag'
    default: return 'file-text'
  }
}

function onCanvasDblClick(e: MouseEvent): void {
  const loc = canvasLocalPoint(e.clientX, e.clientY)
  if (loc.x < 0 || loc.y < 0 || loc.x > CANVAS_W || loc.y > CANVAS_H) return
  createElementAtPoint(loc)
}

function createElementAtPoint(loc: { x: number; y: number }): void {
  const state = store.get()
  const kind = defaultKindForTool(state.activeTool)
  const maxZ = state.elements.reduce((m, el) => Math.max(m, el.zIndex), 0)
  const defIcon = defaultIconForTool(state.activeTool, kind)
  const newEl: QuadElement = {
    id: generateId(),
    kind,
    text: '新元素',
    emoji: '',
    iconName: defIcon,
    x: loc.x - 30,
    y: loc.y - 15,
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
  closeInlineEdit()
  if ((e.target as HTMLElement).closest('.canvas-element')) return

  const state = store.get()
  if (state.activeTool !== 'select') {
    const loc = canvasLocalPoint(e.clientX, e.clientY)
    if (loc.x >= 0 && loc.y >= 0 && loc.x <= CANVAS_W && loc.y <= CANVAS_H) {
      createElementAtPoint(loc)
    }
    return
  }
  store.set({ selectedId: null })
}

export function renderCanvas(): void {
  const container = document.getElementById('elements-container')!
  const state = store.get()
  const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex)
  const seen = new Set<string>()

  for (const el of sorted) {
    seen.add(el.id)
    let dom = container.querySelector(`[data-id="${CSS.escape(el.id)}"]`) as HTMLElement | null
    if (!dom) {
      dom = document.createElement('div')
      dom.dataset.id = el.id
      dom.classList.add('canvas-element')
      container.appendChild(dom)
    }
    applyElementLayout(dom, el)
    const sig = elementContentSig(el)
    if (dom.dataset.contentSig !== sig) {
      fillElementContent(dom, el)
      dom.dataset.contentSig = sig
    }
    dom.classList.toggle('selected', state.selectedId === el.id)
  }

  for (const child of [...container.children]) {
    const id = (child as HTMLElement).dataset.id
    if (id && !seen.has(id)) child.remove()
  }

}

export function renderAxisLabels(): void {
  const { axes, quadrants } = store.get()
  const $ = (id: string) => document.getElementById(id)!
  const canvas = document.getElementById('canvas')!

  canvas.style.setProperty('--axis-x-line', colorWithAlpha(axes.x.color, 0.75))
  canvas.style.setProperty('--axis-y-line', colorWithAlpha(axes.y.color, 0.75))
  canvas.style.setProperty('--axis-x-arrow', colorWithAlpha(axes.x.color, 0.55))
  canvas.style.setProperty('--axis-y-arrow', colorWithAlpha(axes.y.color, 0.55))

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

  const defaultTints = [
    'rgba(232,201,125,0.06)', 'rgba(125,212,232,0.06)',
    'rgba(141,232,125,0.06)', 'rgba(232,125,154,0.06)',
  ]
  for (let i = 0; i < 4; i++) {
    canvas.style.setProperty(`--q${i + 1}`, quadrants[i]?.tint ?? defaultTints[i]!)
  }

  $('axis-x-line').style.display = axes.x.visible ? '' : 'none'
  $('axis-y-line').style.display = axes.y.visible ? '' : 'none'
}

export function initCanvas(): void {
  const container = document.getElementById('elements-container')!
  container.addEventListener('mousedown', onMouseDown)

  const canvasOuter = document.getElementById('canvas-outer')!
  canvasOuter.addEventListener('dblclick', onCanvasDblClick)
  canvasOuter.addEventListener('click', onCanvasClick)
}
