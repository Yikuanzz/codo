import { createElement } from 'lucide'
import {
  Star,
  Flame,
  Zap,
  Tag,
  FileText,
  Phone,
  BookOpen,
  Target,
  Crosshair,
  ListTodo,
  Circle,
  SquareKanban,
  CircleAlert,
} from 'lucide'

type LucideTuple = typeof Star

const ICON_MAP: Record<string, LucideTuple> = {
  star: Star,
  flame: Flame,
  zap: Zap,
  tag: Tag,
  'file-text': FileText,
  phone: Phone,
  'book-open': BookOpen,
  target: Target,
  crosshair: Crosshair,
  'list-todo': ListTodo,
  circle: Circle,
  'square-kanban': SquareKanban,
  'alert-circle': CircleAlert,
}

export const PRESET_ICON_KEYS = [
  'star', 'flame', 'zap', 'tag', 'file-text', 'phone', 'book-open',
  'target', 'crosshair', 'list-todo', 'circle', 'square-kanban', 'alert-circle',
] as const

export type PresetIconKey = (typeof PRESET_ICON_KEYS)[number]

function normalizeIconName(name: string): string {
  return name.trim().toLowerCase().replace(/_/g, '-')
}

export function getLucideSvg(name: string, size: number, strokeColor: string): SVGElement {
  const key = normalizeIconName(name)
  const node = ICON_MAP[key] ?? Star
  const svg = createElement(node) as SVGElement
  svg.setAttribute('width', String(size))
  svg.setAttribute('height', String(size))
  svg.style.display = 'inline-block'
  svg.style.verticalAlign = 'middle'
  svg.style.flexShrink = '0'
  svg.setAttribute('stroke', strokeColor)
  svg.style.pointerEvents = 'none'
  return svg
}