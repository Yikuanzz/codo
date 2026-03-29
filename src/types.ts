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
  tint?: string
}

export type ElementKind = 'card' | 'tag' | 'icon' | 'text'

export interface QuadElement {
  id: string
  kind: ElementKind
  text: string
  emoji: string
  iconName: string
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
        title: '\u91cd\u8981\u7a0b\u5ea6',
        minLabel: '\u4e0d\u91cd\u8981',
        maxLabel: '\u975e\u5e38\u91cd\u8981',
        color: '#e8c97d',
        range: [0, 10],
        visible: true,
      },
      y: {
        title: '\u7d27\u6025\u7a0b\u5ea6',
        minLabel: '\u4e0d\u7d27\u6025',
        maxLabel: '\u975e\u5e38\u7d27\u6025',
        color: '#7dd4e8',
        range: [0, 10],
        visible: true,
      },
    },
    quadrants: [
      { label: '第一象限', emoji: '🔥', name: '重要且紧急', tint: 'rgba(232,201,125,0.06)' },
      { label: '第二象限', emoji: '⚡', name: '紧急不重要', tint: 'rgba(125,212,232,0.06)' },
      { label: '第三象限', emoji: '📋', name: '不重要不紧急', tint: 'rgba(141,232,125,0.06)' },
      { label: '第四象限', emoji: '📌', name: '重要不紧急', tint: 'rgba(232,125,154,0.06)' },
    ],
    elements: [
      { id: 'el-1', kind: 'card', text: '\u9879\u76eeA\u8bc4\u5ba1', emoji: '\uD83D\uDD25', iconName: 'flame', x: 310, y: 110, color: '#e8c97d', fontSize: 12, opacity: 0.9, visible: true, zIndex: 7 },
      { id: 'el-2', kind: 'tag', text: '\u4fee\u590d\u751f\u4ea7Bug', emoji: '\u26A1', iconName: 'zap', x: 360, y: 60, color: '#7dd4e8', fontSize: 11, opacity: 0.9, visible: true, zIndex: 6 },
      { id: 'el-3', kind: 'card', text: '\u5b63\u5ea6\u89c4\u5212', emoji: '\uD83D\uDCCC', iconName: 'target', x: 380, y: 310, color: '#e87d9a', fontSize: 12, opacity: 0.9, visible: true, zIndex: 5 },
      { id: 'el-4', kind: 'icon', text: '\u6574\u7406\u90ae\u4ef6', emoji: '\u2B50', iconName: 'star', x: 130, y: 340, color: '#8de87d', fontSize: 18, opacity: 0.9, visible: true, zIndex: 4 },
      { id: 'el-5', kind: 'tag', text: '\u5ba2\u6237\u63d0\u6848', emoji: '\uD83C\uDFAF', iconName: 'crosshair', x: 70, y: 120, color: '#e8c97d', fontSize: 11, opacity: 0.9, visible: true, zIndex: 3 },
      { id: 'el-6', kind: 'card', text: '\u56e2\u961f\u5468\u4f1a', emoji: '\uD83D\uDCDE', iconName: 'phone', x: 80, y: 180, color: '#7dd4e8', fontSize: 12, opacity: 0.9, visible: true, zIndex: 2 },
      { id: 'el-7', kind: 'text', text: '\u9605\u8bfb\u6280\u672f\u6587\u7ae0', emoji: '\uD83D\uDCDA', iconName: 'book-open', x: 250, y: 400, color: '#7a7a8a', fontSize: 11, opacity: 0.9, visible: true, zIndex: 1 },
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