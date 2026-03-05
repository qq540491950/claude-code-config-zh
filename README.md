# AI CLI 个人配置集合

本仓库用于集中管理多家 AI CLI 的个人配置与工作流说明。

## 子目录

- `claude/`：Claude Code 配置（保留为历史来源）
- `codex/`：Codex 原生配置包（当前主维护目标）
- `gemini/`：Gemini CLI 配置（占位，待补齐）
- `opencode/`：OpenCode 配置（占位，待补齐）

## Claude Code 使用入口

- 使用指南：`claude/README.md`
- 主配置：`claude/CLAUDE.md`
- 一键复制：`node claude/scripts/copy-config.js <目标目录>`
- 配置校验：`node claude/scripts/validate-config.js`
- 基础自测：`node claude/tests/run-all.js`

## Codex 使用入口

- 使用指南：`codex/README.md`
- 主配置：`codex/AGENTS.md`
- 一键复制：`node codex/scripts/copy-config.js <目标目录>`
- 配置校验：`node codex/scripts/validate-config.js`
- 基础自测：`node codex/tests/run-all.js`

## 不同 AI CLI 工具兼容性

### 格式对比

| 工具 | 配置格式 | 兼容性 |
|------|---------|--------|
| **Claude Code** | `CLAUDE.md` + `rules/` | 可用（历史来源） |
| **Codex** | `AGENTS.md` + `.agents/skills` + `.codex/` | 原生落地 |
| **Cursor** | `.cursor/rules` | 需要转换 |
| **Gemini CLI** | 各自格式 | 需要转换 |

### Codex 迁移要点

- 历史 `/ucc-*` 已迁移为 `$ucc-*` 技能。
- `hooks/hooks.json` 已替换为 `.codex/rules/*.rules` + `notify`。
- MCP 配置统一使用 `~/.codex/config.toml` 的 `[mcp_servers]`。

## 使用说明

各工具的详细规则/代理/命令/技能说明，请以对应目录下的 `README.md` 为准：

- Claude Code：`claude/README.md`
- Codex：`codex/README.md`
