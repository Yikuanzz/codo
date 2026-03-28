import { store } from './store'
import { COLORS } from './types'
import { getElementQuadrant } from './canvas'

/* ── Tab switching ── */
export function initTabs(): void {
  document.querySelectorAll<HTMLButtonElement>('.stab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const tab = btn.dataset.tab!
      for (const t of ['axes', 'elements', 'templates']) {
        const el = document.getElementById(`tab-${t}`)
        if (el) el.style.display = t === tab ? 'block' : 'none'
      }
    })
  })
}

/* ── Axis config sidebar ── */
function renderColorSwatches(containerId: string, currentColor: string, axis: 'x' | 'y'): void {
  const row = document.getElementById(containerId)!
  row.innerHTML = ''
  for (const c of COLORS) {
    const swatch = document.createElement('div')
    swatch.classList.add('color-swatch')
    if (c === currentColor) swatch.classList.add('selected')
    swatch.style.background = c
    swatch.addEventListener('click', () => {
      store.patch(`axes.${axis}`, { color: c }, true)
    })
    row.appendChild(swatch)
  }
}

function bindInput(inputId: string, axis: 'x' | 'y', field: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement
  input.addEventListener('input', () => {
    store.patch(`axes.${axis}`, { [field]: input.value })
  })
}

function bindRangeInput(minId: string, maxId: string, axis: 'x' | 'y'): void {
  const minInput = document.getElementById(minId) as HTMLInputElement
  const maxInput = document.getElementById(maxId) as HTMLInputElement
  minInput.addEventListener('change', () => {
    const ax = store.get().axes[axis]
    store.patch(`axes.${axis}`, { range: [Number(minInput.value), ax.range[1]] })
  })
  maxInput.addEventListener('change', () => {
    const ax = store.get().axes[axis]
    store.patch(`axes.${axis}`, { range: [ax.range[0], Number(maxInput.value)] })
  })
}

function bindToggle(toggleId: string, axis: 'x' | 'y'): void {
  const toggle = document.getElementById(toggleId)!
  toggle.addEventListener('click', () => {
    const visible = !store.get().axes[axis].visible
    store.patch(`axes.${axis}`, { visible }, true)
  })
}

export function initAxisBindings(): void {
  bindInput('x-title-input', 'x', 'title')
  bindInput('x-min-label-input', 'x', 'minLabel')
  bindInput('x-max-label-input', 'x', 'maxLabel')
  bindRangeInput('x-range-min', 'x-range-max', 'x')
  bindToggle('x-axis-toggle', 'x')

  bindInput('y-title-input', 'y', 'title')
  bindInput('y-min-label-input', 'y', 'minLabel')
  bindInput('y-max-label-input', 'y', 'maxLabel')
  bindRangeInput('y-range-min', 'y-range-max', 'y')
  bindToggle('y-axis-toggle', 'y')
}

export function renderAxisSidebar(): void {
  const { axes } = store.get()

  const setVal = (id: string, val: string) => {
    const el = document.getElementById(id) as HTMLInputElement
    if (el && document.activeElement !== el) el.value = val
  }

  setVal('x-title-input', axes.x.title)
  setVal('x-min-label-input', axes.x.minLabel)
  setVal('x-max-label-input', axes.x.maxLabel)
  setVal('x-range-min', String(axes.x.range[0]))
  setVal('x-range-max', String(axes.x.range[1]))

  const xDot = document.getElementById('x-axis-dot')!
  xDot.style.background = axes.x.color
  const xToggle = document.getElementById('x-axis-toggle')!
  xToggle.classList.toggle('off', !axes.x.visible)

  renderColorSwatches('x-color-row', axes.x.color, 'x')

  setVal('y-title-input', axes.y.title)
  setVal('y-min-label-input', axes.y.minLabel)
  setVal('y-max-label-input', axes.y.maxLabel)
  setVal('y-range-min', String(axes.y.range[0]))
  setVal('y-range-max', String(axes.y.range[1]))

  const yDot = document.getElementById('y-axis-dot')!
  yDot.style.background = axes.y.color
  const yToggle = document.getElementById('y-axis-toggle')!
  yToggle.classList.toggle('off', !axes.y.visible)

  renderColorSwatches('y-color-row', axes.y.color, 'y')

  // Axis line visibility
  document.getElementById('axis-x-line')!.style.display = axes.x.visible ? '' : 'none'
  document.getElementById('axis-y-line')!.style.display = axes.y.visible ? '' : 'none'
}

export function renderQuadrantConfig(): void {
  const { quadrants } = store.get()
  const grid = document.getElementById('quad-config')!
  const quadColors = ['var(--accent2)', 'var(--accent)', 'var(--accent4)', 'var(--accent3)']
  const borderColors = [
    'rgba(125,212,232,.25)', 'rgba(232,201,125,.25)',
    'rgba(141,232,125,.25)', 'rgba(232,125,154,.25)',
  ]

  const order = [1, 0, 2, 3] // display: Q2 Q1 Q3 Q4
  grid.innerHTML = ''
  for (const i of order) {
    const q = quadrants[i]!
    const cell = document.createElement('div')
    cell.classList.add('quad-cell')
    cell.style.borderColor = borderColors[i]!
    cell.innerHTML = `
      <div class="quad-cell-label">${q.label}</div>
      <div class="quad-cell-name" style="color:${quadColors[i]}">${q.emoji} ${q.name}</div>
      <div class="quad-cell-color" style="background:${quadColors[i]}"></div>
    `
    grid.appendChild(cell)
  }
}

/* ── Element list ── */
export function renderElementList(): void {
  const { elements, selectedId } = store.get()
  const list = document.getElementById('element-list')!
  list.innerHTML = ''

  for (const el of [...elements].reverse()) {
    const kindEmoji: Record<string, string> = { card: '📝', tag: '🏷', icon: '⭐', text: '✏️' }
    const quad = getElementQuadrant(el)
    const item = document.createElement('div')
    item.classList.add('element-item')
    if (el.id === selectedId) item.classList.add('selected')
    item.innerHTML = `
      <div class="element-icon" style="background:${colorAlpha(el.color, 0.12)};color:${el.color}">${kindEmoji[el.kind] ?? '📝'}</div>
      <div class="element-info">
        <div class="element-name">${el.text}</div>
        <div class="element-pos">${quad} · (${Math.round(el.x)}, ${Math.round(el.y)})</div>
      </div>
      <div class="element-vis" data-vis-id="${el.id}">${el.visible ? '👁' : '🚫'}</div>
    `
    item.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.element-vis')) return
      store.set({ selectedId: el.id })
    })
    const visBtn = item.querySelector('.element-vis')!
    visBtn.addEventListener('click', () => {
      store.updateElement(el.id, { visible: !el.visible }, true)
    })
    list.appendChild(item)
  }
}

function colorAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/* ── Templates ── */
export function initTemplates(): void {
  document.querySelectorAll<HTMLElement>('[data-template]').forEach(cell => {
    cell.addEventListener('click', () => {
      const t = cell.dataset.template
      switch (t) {
        case 'eisenhower':
          store.patch('axes.x', { title: '重要程度', minLabel: '不重要', maxLabel: '非常重要', color: '#e8c97d' })
          store.patch('axes.y', { title: '紧急程度', minLabel: '不紧急', maxLabel: '非常紧急', color: '#7dd4e8' })
          break
        case 'boston':
          store.patch('axes.x', { title: '市场份额', minLabel: '低', maxLabel: '高', color: '#7dd4e8' })
          store.patch('axes.y', { title: '市场增速', minLabel: '低', maxLabel: '高', color: '#e87d9a' })
          break
        case 'impact':
          store.patch('axes.x', { title: '执行难度', minLabel: '容易', maxLabel: '困难', color: '#8de87d' })
          store.patch('axes.y', { title: '影响程度', minLabel: '低', maxLabel: '高', color: '#c47de8' })
          break
        case 'risk':
          store.patch('axes.x', { title: '可能性', minLabel: '低', maxLabel: '高', color: '#e87d9a' })
          store.patch('axes.y', { title: '影响程度', minLabel: '低', maxLabel: '高', color: '#e8a87d' })
          break
      }
    })
  })
}
