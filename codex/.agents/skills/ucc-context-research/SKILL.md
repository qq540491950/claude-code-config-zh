---
name: ucc-context-research
description: 快速切换到研究模式（research），适合团队方案评估与个人技术调研。
---

# ucc-context-research

This skill is migrated from legacy command `ucc-context-research` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-context-research`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Context Research 命令

快速切换到研究模式，等价于：`$ucc-context research`。

## 用法

`$ucc-context-research`

## 适用场景

- 团队技术选型、方案论证
- 个人学习新框架或新库
- 复杂问题定位前的信息收集

## 行为准则（research）

- 广泛阅读后再下结论
- 提出澄清性问题
- 边研究边记录发现
- 理解清晰前不写代码

## 输出

切换后应确认当前处于 `research` 模式，并先给发现再给建议。
