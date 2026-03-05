---
name: ucc-e2e
description: 生成并执行关键用户流程的 E2E 测试（Playwright），输出可复现结果。
---

# ucc-e2e

This skill is migrated from legacy command `ucc-e2e` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-e2e`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# E2E 命令

调用 **e2e-runner** 代理，执行端到端测试流程。

## 指令

按以下顺序执行：

1. 识别本次需求/改动对应的关键用户路径
2. 生成或更新 E2E 测试用例
3. 运行 E2E 测试并收集失败信息
4. 输出执行报告与修复建议

## 输出

```
E2E 状态: [通过/失败]
场景数: [X]
通过: [A]
失败: [B]

失败详情:
- 文件: tests/e2e/xxx.spec.ts
- 场景: [名称]
- 问题: [描述]
- 建议: [修复建议]
```

## 参数

$ARGUMENTS 可选：

- `quick` - 仅运行关键主流程
- `full` - 运行完整 E2E 场景（默认）

## 约束

- 禁止通过跳过关键场景来伪造通过
- 禁止引入与当前需求无关的大规模重构
