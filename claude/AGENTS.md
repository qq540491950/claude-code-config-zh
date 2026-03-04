# AGENTS.md（Claude 配置说明）

本文件用于**说明** `claude/agents/` 中各代理（agent）的定位、触发时机与协作方式，便于团队统一用法。

## 配置标识（Namespace）

本配置集的唯一标识为 `UCC`，建议团队在需要“明确使用本配置”的请求中加上调用标记 `@ucc`。

当消息包含 `@ucc` 或通过本仓库 `commands/` 触发斜杠命令时，输出末尾应出现一行：`配置标识：UCC`，用于快速确认是否命中本配置集。

说明：
- Claude Code 的核心入口为 `claude/CLAUDE.md`。
- `claude/agents/` 下的每个 `*.md` 代表一个专用代理配置（含用途与工作流程）。
- 建议在变更 `agents/`、`commands/`、`rules/`、`skills/` 后执行校验：

```bash
node scripts/validate-config.js
node tests/run-all.js
```
