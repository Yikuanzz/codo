# 架构说明

## 技术栈

- **构建**：Vite 6 + TypeScript（vanilla-ts，无框架）
- **样式**：纯 CSS（从原型 HTML 迁移，CSS 变量驱动主题色）
- **字体**：Google Fonts — Noto Sans SC + Space Mono

## 目录结构

```
codo/
├── index.html              # Vite 入口，包含完整布局骨架
├── package.json
├── tsconfig.json
├── vite.config.ts           # 路径别名 @/ → src/
├── docs/                    # 设计与使用文档
│   ├── quadrant-tool.html   # 遗留原型（只读参照）
│   └── *.md
└── src/
    ├── main.ts              # 应用入口：初始化 + 订阅渲染
    ├── types.ts             # AppState 接口、常量、工厂函数
    ├── store.ts             # 集中状态管理（get/set/patch/undo/redo/subscribe）
    ├── storage.ts           # localStorage 持久化 + JSON 导入导出
    ├── canvas.ts            # 画布渲染、元素 DOM 生成、拖拽交互
    ├── sidebar.ts           # 侧栏：坐标轴配置、图层列表、模板
    ├── toolbar.ts           # 顶栏工具按钮切换
    ├── properties.ts        # 右侧属性面板
    ├── statusbar.ts         # 底部状态栏与缩放控件
    ├── style.css            # 全部样式
    └── vite-env.d.ts
```

## 数据流

```
┌──────────┐     patch/set/updateElement     ┌────────┐
│  UI 事件  │ ─────────────────────────────▶  │  Store  │
│ (input,  │                                 │ (state) │
│  click,  │  ◀──────── subscribe ────────── │         │
│  drag)   │       renderAll() 回调           └────────┘
└──────────┘                                      │
                                          scheduleSave()
                                                  ▼
                                         localStorage
```

1. 用户在 UI 上操作（输入、拖拽、点击按钮）触发事件处理函数。
2. 处理函数通过 `store.set()` / `store.patch()` / `store.updateElement()` 更新集中状态。
3. Store 通知所有 `subscribe()` 注册的监听器，执行 `renderAll()` 将 state 映射到 DOM。
4. `renderAll()` 执行后，`storage.ts` 中注册的 `scheduleSave()` 以 400ms 防抖将状态写入 `localStorage`。

## 与旧原型的对应关系

| 原型功能 | 新工程位置 |
|---------|-----------|
| 内联 `<style>` | `src/style.css` |
| 底部 `<script>` | 按职责拆入 `src/canvas.ts`、`src/sidebar.ts`、`src/toolbar.ts` |
| 硬编码 DOM 元素 | 由 `renderCanvas()` 从 `state.elements` 动态生成 |
| `updateAxisLabel()` | `sidebar.ts` 中的 `bindInput()` + `renderAxisLabels()` |

## Vite 配置要点

- `resolve.alias`：`@/` 映射到 `src/`，便于绝对路径引用。
- 默认构建输出 `dist/`；部署时按需设置 `base`。
