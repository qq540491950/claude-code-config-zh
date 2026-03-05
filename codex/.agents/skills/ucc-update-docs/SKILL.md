---
name: ucc-update-docs
description: 根据当前代码与配置变更同步更新文档，保持文档与实现一致。
---

# ucc-update-docs

This skill is migrated from legacy command `ucc-update-docs` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-update-docs`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Update Docs 命令

调用 **doc-updater** 代理，执行文档一致性更新。

## 指令

按以下顺序执行：

1. 识别本次变更影响的文档范围
2. 更新 README/使用说明中的命令、代理、规则、技能引用
3. 校验文档中路径和能力描述是否真实存在
4. 输出文档同步报告

## 输出

```
文档同步状态: [成功/失败]
更新文件:
- README.md
- path/to/file.md

对齐项:
- 命令/代理/规则/技能
- 工作流程
- 验收标准

待人工确认:
- [如有]
```

## 参数

$ARGUMENTS 可选：

- `quick` - 仅更新 README 与核心说明
- `full` - 更新全部受影响文档（默认）

## 约束

- 不创建与当前改动无关的新文档
- 不写入未实现能力
