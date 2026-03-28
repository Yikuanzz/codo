import { store } from './store'
import { EXTENDED_COLORS, ElementKind } from './types'
import { getElementQuadrant } from './canvas'

const KINDS: ElementKind[] = ['card', 'tag', 'icon', 'text']
const KIND_LABELS: Record<ElementKind, string> = {
  card: '卡片', tag: '标签', icon: '图标', text: '文字',
}

export function renderProperties(): void {
  const body = document.getElementById('properties-body')!
  const { elements, selectedId } = store.get()
  const el = elements.find(e => e.id === selectedId)

  if (!el) {
    body.innerHTML = `
      <div class="no-selection">
        <div class="no-selection-icon">🎯</div>
        <div class="no-selection-text">点击画布上的元素<br>查看和编辑属性</div>
      </div>
    `
    return
  }

  const quad = getElementQuadrant(el)
  const quadColors: Record<string, string> = {
    Q1: 'var(--accent)', Q2: 'var(--accent2)', Q3: 'var(--accent4)', Q4: 'var(--accent3)',
  }
  const quadNames: Record<string, string> = {
    Q1: 'Ⅰ 重要且紧急', Q2: 'Ⅱ 紧急不重要', Q3: 'Ⅲ 不重要不紧急', Q4: 'Ⅳ 重要不紧急',
  }

  body.innerHTML = `
    <div class="prop-row">
      <div class="prop-label">内容</div>
      <input class="prop-input" id="prop-text" value="${escHtml(el.text)}">
    </div>
    <div class="prop-row">
      <div class="prop-label">Emoji / 图标</div>
      <input class="prop-input" id="prop-emoji" value="${el.emoji}" style="font-size:16px">
    </div>
    <div class="prop-row">
      <div class="prop-label">位置 (X / Y)</div>
      <div class="prop-xy">
        <input class="prop-input" id="prop-x" value="${Math.round(el.x)}" style="text-align:center;font-family:'Space Mono',monospace;font-size:11px">
        <input class="prop-input" id="prop-y" value="${Math.round(el.y)}" style="text-align:center;font-family:'Space Mono',monospace;font-size:11px">
      </div>
    </div>
    <div class="prop-row">
      <div class="prop-label">字体大小</div>
      <div class="font-size-row">
        <button class="fs-btn" id="fs-dec">−</button>
        <div class="fs-value" id="fs-val">${el.fontSize}px</div>
        <button class="fs-btn" id="fs-inc">+</button>
      </div>
    </div>
    <div class="prop-row">
      <div class="prop-label">颜色</div>
      <div class="color-picker-row" id="prop-color-row"></div>
    </div>
    <div class="prop-row">
      <div class="prop-label">不透明度</div>
      <input type="range" class="opacity-slider" id="prop-opacity" min="10" max="100" value="${Math.round(el.opacity * 100)}">
      <div style="text-align:right;font-family:'Space Mono',monospace;font-size:10px;color:var(--text-dim);margin-top:3px" id="opacity-val">${Math.round(el.opacity * 100)}%</div>
    </div>
    <div class="prop-row">
      <div class="prop-label">元素类型</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap" id="type-pills"></div>
    </div>
    <div class="prop-row">
      <div class="prop-label">图层操作</div>
      <div class="layer-btns">
        <button class="layer-btn" id="layer-up">↑ 上移</button>
        <button class="layer-btn" id="layer-down">↓ 下移</button>
        <button class="layer-btn" id="layer-delete" style="color:rgba(232,125,154,.7);border-color:rgba(232,125,154,.2)">删除</button>
      </div>
    </div>
    <div class="prop-row">
      <div class="prop-label">所在象限</div>
      <div style="padding:6px 10px;border-radius:6px;background:rgba(232,201,125,.08);border:1px solid rgba(232,201,125,.2);font-size:11px;color:${quadColors[quad] ?? 'var(--accent)'}">
        ${quadNames[quad] ?? quad}
      </div>
    </div>
  `

  // Color swatches
  const colorRow = document.getElementById('prop-color-row')!
  for (const c of EXTENDED_COLORS) {
    const swatch = document.createElement('div')
    swatch.classList.add('cp-swatch')
    if (c === el.color) swatch.classList.add('selected')
    swatch.style.background = c
    swatch.addEventListener('click', () => {
      store.updateElement(el.id, { color: c }, true)
    })
    colorRow.appendChild(swatch)
  }

  // Type pills
  const pillContainer = document.getElementById('type-pills')!
  for (const k of KINDS) {
    const pill = document.createElement('div')
    pill.classList.add('type-pill')
    if (k === el.kind) pill.classList.add('active')
    pill.textContent = KIND_LABELS[k]
    pill.addEventListener('click', () => {
      store.updateElement(el.id, { kind: k }, true)
    })
    pillContainer.appendChild(pill)
  }

  // Event bindings
  bindPropInput('prop-text', el.id, 'text')
  bindPropInput('prop-emoji', el.id, 'emoji')
  bindPropNumber('prop-x', el.id, 'x')
  bindPropNumber('prop-y', el.id, 'y')

  document.getElementById('fs-dec')!.addEventListener('click', () => {
    store.updateElement(el.id, { fontSize: Math.max(8, el.fontSize - 1) }, true)
  })
  document.getElementById('fs-inc')!.addEventListener('click', () => {
    store.updateElement(el.id, { fontSize: Math.min(48, el.fontSize + 1) }, true)
  })

  const opSlider = document.getElementById('prop-opacity') as HTMLInputElement
  opSlider.addEventListener('input', () => {
    const val = Number(opSlider.value) / 100
    store.updateElement(el.id, { opacity: val })
    document.getElementById('opacity-val')!.textContent = `${opSlider.value}%`
  })

  document.getElementById('layer-up')!.addEventListener('click', () => store.moveElementLayer(el.id, 'up'))
  document.getElementById('layer-down')!.addEventListener('click', () => store.moveElementLayer(el.id, 'down'))
  document.getElementById('layer-delete')!.addEventListener('click', () => store.removeElement(el.id))
}

function bindPropInput(inputId: string, elId: string, field: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement
  input.addEventListener('input', () => {
    store.updateElement(elId, { [field]: input.value })
  })
}

function bindPropNumber(inputId: string, elId: string, field: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement
  input.addEventListener('change', () => {
    store.updateElement(elId, { [field]: Number(input.value) }, true)
  })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
