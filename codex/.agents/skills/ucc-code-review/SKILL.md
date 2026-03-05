---
name: ucc-code-review
description: 全面的安全和质量审查未提交的更改。
---

# ucc-code-review

This skill is migrated from legacy command `ucc-code-review` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-code-review`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Code Review 命令

对未提交的更改进行全面的安全和质量审查：

1. 获取变更文件：git diff --name-only HEAD

2. 对每个变更文件检查：

**安全问题（关键）：**
- 硬编码凭据、API 密钥、令牌
- SQL 注入漏洞
- XSS 漏洞
- 缺少输入验证
- 不安全的依赖
- 路径遍历风险

**代码质量（高）：**
- 函数 > 50 行
- 文件 > 800 行
- 嵌套深度 > 4 层
- 缺少错误处理
- console.log 语句
- TODO/FIXME 注释
- 公共 API 缺少 JSDoc

**最佳实践（中）：**
- 修改模式（使用不可变替代）
- 代码/注释中使用表情
- 新代码缺少测试
- 可访问性问题（a11y）

3. 生成报告，包含：
   - 严重程度：关键、高、中、低
   - 文件位置和行号
   - 问题描述
   - 建议修复

4. 如发现关键或高优先级问题则阻止提交

**永不批准有安全漏洞的代码！**

## 审查输出格式

```
[严重程度] 问题标题
文件: path/to/file.ts:42
问题: 描述
修复: 如何修改
```

## 批准标准

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 | 无关键或高优先级问题 |
| ⚠️ 警告 | 仅有中优先级问题（可谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |
