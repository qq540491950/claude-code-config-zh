# AI CLI 个人配置集合

本仓库用于集中管理多家 AI CLI 的个人配置与工作流说明。

## 子目录

- `claude/`：Claude Code 配置（当前已完整可用，含校验与自测）
- `codex/`：Codex CLI 配置（占位，待补齐）
- `gemini/`：Gemini CLI 配置（占位，待补齐）
- `opencode/`：OpenCode 配置（占位，待补齐）

## Claude Code 使用入口

- 使用指南：`claude/README.md`
- 主配置：`claude/CLAUDE.md`
- 一键复制：`node claude/scripts/copy-config.js <目标目录>`
- 配置校验：`node claude/scripts/validate-config.js`
- 基础自测：`node claude/tests/run-all.js`

## 不同 AI CLI 工具兼容性

### 格式对比

| 工具 | 配置格式 | 兼容性 |
|------|---------|--------|
| **Claude Code** | `CLAUDE.md` + `rules/` | 完全兼容 |
| **Codex CLI** | `AGENTS.md` + `.codex/` | 需要转换 |
| **Cursor** | `.cursor/rules` | 需要转换 |
| **Gemini CLI** | 各自格式 | 需要转换 |

### 核心概念通用

虽然格式不同，但以下概念是**通用的**：

| 概念 | 说明 | 迁移建议 |
|------|------|---------|
| **规则 (rules)** | 编码规范和约束 | 可直接复制内容 |
| **代理 (agents)** | 专业任务处理器 | 改写为对应格式 |
| **命令 (commands)** | 用户可调用的指令 | 改写为对应格式 |
| **技能 (skills)** | 工作流和领域知识 | 可直接复制内容 |
| **上下文 (contexts)** | 工作模式切换 | 可直接复制内容 |

## 使用说明

各工具的详细规则/代理/命令/技能说明，请以对应目录下的 `README.md` 为准：

- Claude Code：`claude/README.md`
