---
name: ucc-router
description: 解析历史 /ucc-* 命令意图并路由到对应 $ucc-* 技能，兼容旧使用习惯。
---

# ucc-router

用于承接历史 `/ucc-*` 输入习惯的路由技能。

## 触发条件

- 用户输入 `/ucc-*` 形式的旧命令
- 用户提到“原本要用某个 ucc 命令”

## 路由步骤

1. 识别旧命令名并去掉前缀 `/`
2. 映射为同名技能（例如 `/ucc-context-dev` -> `$ucc-context-dev`）
3. 将参数原样透传给目标技能
4. 在输出前提示“已从旧命令迁移为技能调用”

## 已注册映射

- `ucc-build-fix`
- `ucc-checkpoint`
- `ucc-code-review`
- `ucc-context`
- `ucc-context-dev`
- `ucc-context-research`
- `ucc-context-review`
- `ucc-e2e`
- `ucc-go-build`
- `ucc-go-review`
- `ucc-go-test`
- `ucc-javascript-review`
- `ucc-learn`
- `ucc-plan`
- `ucc-refactor-clean`
- `ucc-sessions`
- `ucc-skill-create`
- `ucc-tdd`
- `ucc-test-coverage`
- `ucc-update-docs`
- `ucc-verify`

## 输出约定

- 先说明路由结果
- 再输出目标技能执行结果
- 命中 UCC 语义时追加：`配置标识：UCC`
