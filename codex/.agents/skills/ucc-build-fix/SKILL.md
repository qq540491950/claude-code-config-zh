---
name: ucc-build-fix
description: 复现并修复当前项目的构建/类型检查错误，输出修复报告。
---

# ucc-build-fix

This skill is migrated from legacy command `ucc-build-fix` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-build-fix`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Build Fix 命令

调用 **build-error-resolver** 代理，修复构建失败问题。

## 指令

按以下顺序执行：

1. 运行构建命令并记录首个失败点
2. 若存在类型检查命令，单独运行并记录错误
3. 仅做最小必要修改修复根因
4. 重新运行构建与类型检查确认通过
5. 运行相关测试验证无回归

## 输出

输出修复报告，包含：

```
修复状态: [成功/失败]
根因: [一句话]
修改文件:
- path/to/file1
- path/to/file2

验证结果:
- build: [通过/失败]
- typecheck: [通过/失败]
- tests: [通过/失败/未运行]

剩余问题:
- [若有，列出]
```

## 参数

$ARGUMENTS 可选：

- `quick` - 仅修复并验证 build + typecheck
- `full` - 修复并验证 build + typecheck + tests（默认）

## 约束

- 禁止通过关闭规则或忽略类型错误绕过失败
- 禁止删除测试以换取通过
- 保持改动最小且可解释

## 相关代理

此命令调用 `build-error-resolver` 代理，位于：
`agents/build-error-resolver.md`
