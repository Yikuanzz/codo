export interface AxisConfig {
  title: string
  minLabel: string
  maxLabel: string
  color: string
  range: [number, number]
  visible: boolean
}

export interface QuadrantConfig {
  label: string
  emoji: string
  name: string
}

export type ElementKind = 'card' | 'tag' | 'icon' | 'text'

export interface QuadElement {
  id: string
  kind: ElementKind
  text: string
  emoji: string
  x: number
  y: number
  color: string
  fontSize: number
  opacity: number
  visible: boolean
  zIndex: number
}

export type ToolType = 'select' | 'text' | 'rect' | 'circle' | 'card' | 'icon' | 'line'

export interface Viewport {
  zoom: number
  panX: number
  panY: number
}

export interface AppState {
  version: number
  axes: {
    x: AxisConfig
    y: AxisConfig
  }
  quadrants: [QuadrantConfig, QuadrantConfig, QuadrantConfig, QuadrantConfig]
  elements: QuadElement[]
  selectedId: string | null
  activeTool: ToolType
  viewport: Viewport
}

export const SCHEMA_VERSION = 1

export const COLORS = [
  '#e8c97d', '#7dd4e8', '#e87d9a', '#8de87d', '#c47de8', '#e8a87d',
] as const

export const EXTENDED_COLORS = [
  ...COLORS, '#f0f0f0', '#7a7a8a',
] as const

export function createDefaultState(): AppState {
  return {
    version: SCHEMA_VERSION,
    axes: {
      x: {
        title: '重要程度',
        minLabel: '不重要',
        maxLabel: '非常重要',
        color: '#e8c97d',
        range: [0, 10],
        visible: true,
      },
      y: {
        title: '紧急程度',
        minLabel: '不紧急',
        maxLabel: '非常紧急',
        color: '#7dd4e8',
        range: [0, 10],
        visible: true,
      },
    },
    quadrants: [
      { label: '第一象限', emoji: '🔥', name: '重要且紧急' },
      { label: '第二象限', emoji: '⚡', name: '紧急不重要' },
      { label: '第三象限', emoji: '📋', name: '不重要不紧急' },
      { label: '第四象限', emoji: '📌', name: '重要不紧急' },
    ],
    elements: [
      { id: 'el-1', kind: 'card', text: '项目A评审', emoji: '🔥', x: 310, y: 110, color: '#e8c97d', fontSize: 12, opacity: 0.9, visible: true, zIndex: 7 },
      { id: 'el-2', kind: 'tag', text: '修复生产Bug', emoji: '⚡', x: 360, y: 60, color: '#7dd4e8', fontSize: 11, opacity: 0.9, visible: true, zIndex: 6 },
      { id: 'el-3', kind: 'card', text: '季度规划', emoji: '📌', x: 380, y: 310, color: '#e87d9a', fontSize: 12, opacity: 0.9, visible: true, zIndex: 5 },
      { id: 'el-4', kind: 'icon', text: '整理邮件', emoji: '⭐', x: 130, y: 340, color: '#8de87d', fontSize: 18, opacity: 0.9, visible: true, zIndex: 4 },
      { id: 'el-5', kind: 'tag', text: '客户提案', emoji: '🎯', x: 70, y: 120, color: '#e8c97d', fontSize: 11, opacity: 0.9, visible: true, zIndex: 3 },
      { id: 'el-6', kind: 'card', text: '团队周会', emoji: '📞', x: 80, y: 180, color: '#7dd4e8', fontSize: 12, opacity: 0.9, visible: true, zIndex: 2 },
      { id: 'el-7', kind: 'text', text: '阅读技术文章', emoji: '📚', x: 250, y: 400, color: '#7a7a8a', fontSize: 11, opacity: 0.9, visible: true, zIndex: 1 },
    ],
    selectedId: null,
    activeTool: 'select',
    viewport: { zoom: 1, panX: 0, panY: 0 },
  }
}

let _nextId = 100
export function generateId(): string {
  return `el-${Date.now()}-${_nextId++}`
}
