# 轻量 Hooks（可选启用）

本目录提供最小可用 hooks：

- `PreToolUse`：阻断明显高风险的删除/格式化命令
- `PreToolUse`：写入前检测常见敏感信息模式（提醒）
- `Stop`：每次响应后提醒进行交付检查

## 文件

- `hooks/hooks.json`：可直接复用的轻量 hooks 配置

## 启用方式

将 `hooks/hooks.json` 中的 `hooks` 字段合并到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [],
    "Stop": []
  }
}
```

> 说明：本仓库默认不强制启用 hooks，按需手动开启，保持“精简可用”。

## 行为说明

- 阻断通过 `exit code 2` 实现（仅 PreToolUse 生效）
- 提醒为非阻断输出（stderr）
- 使用 Node.js 命令，兼容 Windows / macOS / Linux
- 团队模式可结合 `/update-docs` 与 `/e2e` 形成更完整交付门禁
