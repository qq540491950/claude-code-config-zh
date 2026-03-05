# Codex 原生配置包（UCC）

本目录已从 Claude 镜像结构迁移为 Codex 原生可执行结构。

## 你会得到什么

- `AGENTS.md`：唯一核心指令入口
- `.agents/skills/`：`$ucc-*` 技能体系（替代历史 `/ucc-*`）
- `.codex/config.toml`：项目级 Codex 配置
- `.codex/rules/default.rules`：执行策略规则（exec policy）
- `.codex/templates/`：最小可用 + 完整治理模板
- `scripts/` + `tests/`：复制、校验与基础自测

## 迁移后的接口

| 旧方式 | 新方式 | 状态 |
| --- | --- | --- |
| `/ucc-context-dev` | `$ucc-context-dev` 或自然语言“切换到 dev 工作流” | 强制迁移 |
| `hooks/hooks.json` (`PreToolUse/Stop`) | `.codex/rules/*.rules` + `notify` | 强制迁移 |
| `rules/**/*.md` 作为执行规则 | `.rules` 作为执行规则，Markdown 仅作规范文档 | 强制迁移 |
| 旧版 MCP JSON 配置 | `~/.codex/config.toml` 的 `[mcp_servers]` | 强制迁移 |

## 快速使用

1. 复制配置到目标项目：
   `node codex/scripts/copy-config.js <目标目录>`
2. 在目标项目执行校验：
   `node codex/scripts/validate-config.js`
3. 运行自测：
   `node codex/tests/run-all.js`

## 技能调用方式

- 显式：`$ucc-plan`、`$ucc-code-review`、`$ucc-context-dev`
- 兼容：`$ucc-router`（把旧 `/ucc-*` 意图路由到技能）
- 隐式：直接描述任务目标，由 Codex 按技能描述匹配

## 模板说明

- 最小可用模板：`.codex/templates/config.minimal.toml`
- 完整治理模板：`.codex/templates/config.full.toml`

模板包含 Codex 原生 MCP 片段，可直接粘贴到 `~/.codex/config.toml` 或项目 `.codex/config.toml`。

## 历史归档

`legacy/` 保存迁移前的 Claude 镜像内容，仅用于追溯，不参与当前运行。
