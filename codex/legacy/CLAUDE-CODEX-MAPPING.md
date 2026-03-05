# Claude -> Codex 映射说明

本文档用于说明如何在 Codex 中尽量复用 `claude/` 配置。

## 一、同源镜像（强一致）

以下目录在 `codex/` 中保持与 `claude/` 同源，使用 `codex/scripts/sync-from-claude.js` 统一同步：

- `rules/`
- `agents/`
- `commands/`
- `skills/`
- `contexts/`
- `hooks/`
- `mcp-configs/`
- `docs/`
- `examples/`

这部分是“能力一致性”的核心保障。

## 二、入口差异（适配层）

| Claude Code | Codex |
|---|---|
| `CLAUDE.md` | `AGENTS.md` |
| 原生斜杠命令 | 文本命令兼容层（`/ucc-*`） |

在 Codex 中通过 `AGENTS.md` 复现 Claude 的核心执行策略：

1. 通过 `@ucc` 强制命中配置；
2. 通过 `/ucc-*` 文本命令映射到 `commands/`；
3. 命中时输出 `配置标识：UCC` 用于排障。

## 三、可执行保障（工程化）

- 复制脚本：`codex/scripts/copy-config.js`
- 同步脚本：`codex/scripts/sync-from-claude.js`
- 结构校验：`codex/scripts/validate-config.js`
- 自测入口：`codex/tests/run-all.js`

建议流程：

1. `node codex/scripts/sync-from-claude.js`
2. `node codex/scripts/validate-config.js`
3. `node codex/tests/run-all.js`
4. `node codex/scripts/copy-config.js <目标目录>`
