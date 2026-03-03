---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 TypeScript 特定内容。

## 测试框架

- 单元/集成测试：Vitest 或 Jest
- E2E 测试：Playwright（关键流程）

## TDD 要求

1. 先写失败测试（Red）
2. 最小实现让测试通过（Green）
3. 重构并保持测试通过（Refactor）

## 覆盖率

- 目标覆盖率：80%+
- 新增逻辑必须有对应测试

## 必测场景

- 空值与可选参数
- 异常分支与错误处理
- 边界值
- 异步流程失败场景

## 常用命令

```bash
npm run test
npm run test:coverage
npx playwright test
```
