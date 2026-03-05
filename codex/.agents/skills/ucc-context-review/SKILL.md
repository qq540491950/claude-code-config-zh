---
name: ucc-context-review
description: 快速切换到审查模式（review），适合团队评审与个人质量检查。
---

# ucc-context-review

This skill is migrated from legacy command `ucc-context-review` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-context-review`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Context Review 命令

快速切换到审查模式，等价于：`$ucc-context review`。

## 用法

`$ucc-context-review`

## 适用场景

- 团队 PR 审查
- 个人提交前自查
- 回归检查、风险排查

## 行为准则（review）

- 评论前完整阅读代码
- 按严重性排序问题（严重 > 高 > 中 > 低）
- 提出修复建议，不只是指出问题
- 检查安全漏洞

## 输出

切换后应确认当前处于 `review` 模式，并按审查格式输出问题与建议。
