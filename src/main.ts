import './style.css'
import { store } from './store'
import { initStorage } from './storage'
import { exportJSON, importJSON } from './storage'
import { initCanvas, renderCanvas, renderAxisLabels } from './canvas'
import { initTabs, initAxisBindings, initTemplates, renderAxisSidebar, renderQuadrantConfig, renderElementList } from './sidebar'
import { initToolbar, renderToolbar } from './toolbar'
import { renderProperties } from './properties'
import { renderStatusBar, initZoom } from './statusbar'

function renderAll(): void {
  renderAxisSidebar()
  renderQuadrantConfig()
  renderAxisLabels()
  renderCanvas()
  renderElementList()
  renderProperties()
  renderToolbar()
  renderStatusBar()
}

function init(): void {
  initStorage()
  initCanvas()
  initTabs()
  initAxisBindings()
  initTemplates()
  initToolbar()
  initZoom()

  // Top-bar buttons
  document.getElementById('btn-export')!.addEventListener('click', exportJSON)
  document.getElementById('btn-import')!.addEventListener('click', importJSON)
  document.getElementById('btn-save')!.addEventListener('click', () => {
    localStorage.setItem('codo-quadrant-state', JSON.stringify(store.get()))
    const dot = document.getElementById('save-dot')!
    const status = document.getElementById('save-status')!
    dot.classList.remove('unsaved')
    status.textContent = '已保存'
  })

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault()
      store.undo()
    }
    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault()
      store.redo()
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const { selectedId } = store.get()
      const active = document.activeElement?.tagName
      if (selectedId && active !== 'INPUT' && active !== 'TEXTAREA') {
        store.removeElement(selectedId)
      }
    }
  })

  store.subscribe(renderAll)

  renderAll()
}

document.addEventListener('DOMContentLoaded', init)
