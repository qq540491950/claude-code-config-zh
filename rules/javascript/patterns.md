---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 常用模式

## 错误边界（服务端）

```javascript
async function safeRun(task) {
  try {
    return await task()
  } catch (error) {
    throw new Error(`执行失败: ${String(error)}`)
  }
}
```

## 请求参数校验

```javascript
function validatePagination(query) {
  const limit = Number(query.limit ?? 20)
  const page = Number(query.page ?? 1)
  if (!Number.isInteger(limit) || limit <= 0) throw new Error('limit 无效')
  if (!Number.isInteger(page) || page <= 0) throw new Error('page 无效')
  return { limit, page }
}
```

## 依赖注入（便于测试）

```javascript
function createUserService({ userRepo, logger }) {
  return {
    async create(input) {
      const user = await userRepo.create(input)
      logger.info('user-created', { id: user.id })
      return user
    },
  }
}
```
