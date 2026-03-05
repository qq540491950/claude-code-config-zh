# AGENTS.md

此文件是 Codex 在本仓库中的唯一核心指令入口。

## 配置标识（UCC）

- 配置代号：`UCC`
- 上下文标签：`@ucc`
- 调试尾标：命中本配置语义时，最终输出末尾追加 `配置标识：UCC`

## 生效范围与优先级

1. 本文件为仓库根指令。
2. 如子目录存在 `AGENTS.override.md` 或 `AGENTS.md`，按 Codex 规则进行分层覆盖。
3. `.agents/skills/` 提供可复用工作流能力；技能可显式触发或隐式匹配。

## 命令迁移策略

- 历史 `/ucc-*` 斜杠命令已退役，不再声明为 Codex 原生命令能力。
- 新入口统一为技能调用：`$ucc-*`（例如 `$ucc-context-dev`、`$ucc-plan`）。
- 兼容历史习惯时，使用 `$ucc-router` 将旧意图路由到对应技能。

## 执行与安全

- 命令执行安全由 `.codex/rules/*.rules` 和 `.codex/config.toml` 控制。
- 不依赖 `hooks/hooks.json` 的 `PreToolUse` / `Stop` 事件模型。
- 需要回合结束提醒时，使用 `notify` 配置项调用脚本。

## 工作约束

1. 优先复用技能，不重复造轮子。
2. 涉及改动时先验证，至少完成最小可行检查（测试/构建/静态检查之一）。
3. 禁止硬编码密钥，敏感输入必须验证。
4. 解释与结论默认简体中文；代码、命令、路径保留原文。

## 目录约定（运行态）

```
codex/
├── AGENTS.md
├── .agents/skills/
├── .codex/config.toml
├── .codex/rules/default.rules
├── scripts/
├── docs/
└── tests/
```

`legacy/` 仅用于历史归档，不作为运行入口。
