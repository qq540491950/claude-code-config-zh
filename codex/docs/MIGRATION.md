# UCC 迁移公告（Codex 原生）

## 已完成迁移

- 指令入口统一为 `AGENTS.md`
- 历史 `/ucc-*` 已退役，迁移为 `$ucc-*` 技能
- 执行策略迁移为 `.codex/rules/*.rules`
- 钩子提醒迁移为 `notify`
- MCP 配置迁移为 `config.toml` 的 `[mcp_servers]`

## 使用方式变化

| 旧方式 | 新方式 |
| --- | --- |
| `/ucc-plan` | `$ucc-plan` |
| `/ucc-context-dev` | `$ucc-context-dev` |
| `/ucc-code-review` | `$ucc-code-review` |
| `hooks/hooks.json` | `.codex/rules/default.rules` + `notify` |
| 旧版 MCP JSON 配置 | `~/.codex/config.toml` |

## 兼容说明

- 旧命令意图可通过 `$ucc-router` 自动路由。
- `legacy/` 仅用于追溯历史内容，不参与运行。
