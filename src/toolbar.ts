import { store } from './store'
import { ToolType } from './types'

const TOOL_LABELS: Record<ToolType, string> = {
  select: 'SELECT',
  text: 'TEXT',
  rect: 'RECT',
  circle: 'CIRCLE',
  card: 'CARD',
  icon: 'ICON',
  line: 'LINE',
}

export function initToolbar(): void {
  document.querySelectorAll<HTMLButtonElement>('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool as ToolType | undefined
      if (tool) store.set({ activeTool: tool })
    })
  })
}

export function renderToolbar(): void {
  const { activeTool } = store.get()

  document.querySelectorAll<HTMLButtonElement>('.tool-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === activeTool)
  })

  const nameEl = document.getElementById('active-tool-name')
  if (nameEl) nameEl.textContent = TOOL_LABELS[activeTool] ?? 'SELECT'
}
