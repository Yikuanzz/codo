# CODO — 四象限工具 文档索引

CODO 是一个基于 Web 的四象限画布工具，用户可以自定义横纵轴（名称、颜色、刻度范围），然后在画布上添加和编辑文字、卡片、图标等元素，实现可视化决策与事务管理。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

构建产物输出至 `dist/` 目录。如需部署到子路径（如 GitHub Pages），在 `vite.config.ts` 中设置 `base: '/codo/'`。

## 文档目录

| 文件 | 说明 |
|------|------|
| [DESIGN.md](DESIGN.md) | 产品愿景与功能定义 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 源码结构、数据流与 Vite 配置要点 |
| [STATE_SCHEMA.md](STATE_SCHEMA.md) | `AppState` JSON 字段说明、localStorage 约定、导出文件格式 |
| [USER_GUIDE.md](USER_GUIDE.md) | 使用指南：快捷键、工具栏、保存/导出、已知限制 |

## 遗留原型

[quadrant-tool.html](quadrant-tool.html) 为早期静态 HTML 原型，已由 Vite 应用完全替代（2026-03-28）。保留作 UI 设计参照。
