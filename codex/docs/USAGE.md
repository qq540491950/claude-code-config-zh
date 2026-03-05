# 使用说明

## 一、将配置复制到项目

```bash
node codex/scripts/copy-config.js <目标目录>
```

复制后目标目录应至少包含：

- `AGENTS.md`
- `.agents/skills/`
- `.codex/config.toml`
- `.codex/rules/default.rules`

## 二、校验配置

```bash
node codex/scripts/validate-config.js
node codex/tests/run-all.js
```

## 三、推荐调用方式

- 显式技能：`$ucc-plan`、`$ucc-tdd`、`$ucc-context-dev`
- 兼容路由：`$ucc-router`
- 自然语言：直接描述任务目标，由技能隐式匹配

## 四、模板选择

- 个人快速启动：`.codex/templates/config.minimal.toml`
- 团队治理：`.codex/templates/config.full.toml`
