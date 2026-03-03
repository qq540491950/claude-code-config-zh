---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 JavaScript/Node 特定内容。

## 测试要求

- 新增逻辑必须有单元测试
- API 路由和关键服务必须有集成测试
- 关键用户流程建议补 E2E（Playwright）

## 覆盖率

- 目标覆盖率：80%+
- 对错误分支与边界输入必须覆盖

## 推荐工具

- 单元/集成：Vitest 或 Jest
- E2E：Playwright

## 常用命令

```bash
npm run test
npm run test:coverage
npx playwright test
```
