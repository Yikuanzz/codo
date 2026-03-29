# AppState Schema

当前版本号：`SCHEMA_VERSION = 1`

## 顶层结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | `number` | Schema 版本号，用于加载时兼容性校验 |
| `axes` | `{ x: AxisConfig, y: AxisConfig }` | 横纵轴配置 |
| `quadrants` | `[Q, Q, Q, Q]` | 四个象限元信息（依次为 Q1–Q4） |
| `elements` | `QuadElement[]` | 画布上所有元素 |
| `selectedId` | `string \| null` | 当前选中元素 ID |
| `activeTool` | `ToolType` | 当前激活工具 |
| `viewport` | `Viewport` | 缩放与平移状态 |

## AxisConfig

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 轴标题，如 "重要程度" |
| `minLabel` | `string` | 轴低端标签，如 "不重要" |
| `maxLabel` | `string` | 轴高端标签，如 "非常重要" |
| `color` | `string` | 主题色 hex，如 `#e8c97d` |
| `range` | `[number, number]` | 刻度范围，如 `[0, 10]` |
| `visible` | `boolean` | 轴线是否显示 |

## QuadrantConfig

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | `string` | 象限标签，如 "第一象限" |
| `emoji` | `string` | 象限 Emoji |
| `name` | `string` | 象限名称，如 "重要且紧急" |

## QuadElement

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 唯一标识，格式 `el-{timestamp}-{seq}` |
| `kind` | `'card' \| 'tag' \| 'icon' \| 'text'` | 元素视觉类型 |
| `text` | `string` | 显示文本 |
| `emoji` | `string` | 遗留字段，兼容旧 JSON |
| `iconName` | `string` | Lucide 图标 id（kebab-case），如 `star`、`file-text` |
| `x` | `number` | 画布像素坐标 X |
| `y` | `number` | 画布像素坐标 Y |
| `color` | `string` | 元素主题色 hex |
| `fontSize` | `number` | 字体大小 (px) |
| `opacity` | `number` | 不透明度 0–1 |
| `visible` | `boolean` | 是否可见 |
| `zIndex` | `number` | 图层顺序 |

## ToolType

可选值：`'select'` | `'text'` | `'rect'` | `'circle'` | `'card'` | `'icon'` | `'line'`

## Viewport

| 字段 | 类型 | 说明 |
|------|------|------|
| `zoom` | `number` | 缩放倍率（0.3–3） |
| `panX` | `number` | 水平平移（预留） |
| `panY` | `number` | 垂直平移（预留） |

导入或读取 localStorage 时，若元素缺少 `iconName`，会默认补为 `star`。

## 持久化约定

- **localStorage key**：`codo-quadrant-state`
- **写入时机**：状态变更后 400ms 防抖自动写入；点击"保存"按钮立即写入
- **加载时机**：应用初始化时读取。若 `version` 不匹配，忽略并使用默认状态

## 导出文件

- **格式**：JSON，与 `AppState` 结构完全一致
- **文件名**：`quadrant-YYYY-MM-DD.json`
- **导入**：通过顶栏"导入"按钮选择 `.json` 文件加载，校验 `version` 字段
