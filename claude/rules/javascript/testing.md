---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 JavaScript/Node 特定内容。

## 测试框架

| 类型 | 推荐工具 |
|------|---------|
| 单元测试 | Vitest / Jest |
| 集成测试 | Vitest / Jest + Supertest |
| E2E 测试 | Playwright |

## TDD 工作流

1. **红**：先写失败测试
2. **绿**：最小实现让测试通过
3. **重构**：优化代码并保持测试通过

## 单元测试

### 基础测试

```javascript
import { describe, it, expect, beforeEach } from 'vitest'
import { Calculator } from './calculator'

describe('Calculator', () => {
  let calc

  beforeEach(() => {
    calc = new Calculator()
  })

  it('应该正确相加', () => {
    expect(calc.add(2, 3)).toBe(5)
  })

  it('应该正确相减', () => {
    expect(calc.subtract(5, 3)).toBe(2)
  })

  it('除零应该抛出错误', () => {
    expect(() => calc.divide(1, 0)).toThrow('不能除以零')
  })
})
```

### 异步测试

```javascript
import { describe, it, expect } from 'vitest'

describe('异步操作', () => {
  it('应该返回数据', async () => {
    const data = await fetchData(1)
    expect(data).toEqual({ id: 1, name: 'Test' })
  })

  it('应该处理错误', async () => {
    await expect(fetchData(-1)).rejects.toThrow('无效的 ID')
  })
})
```

### Mock 测试

```javascript
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('UserService', () => {
  const mockRepo = {
    findById: vi.fn(),
    create: vi.fn()
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该调用 repo 创建用户', async () => {
    mockRepo.create.mockResolvedValue({ id: 1, name: 'Alice' })

    const service = createUserService({ userRepo: mockRepo })
    const result = await service.create({ name: 'Alice' })

    expect(mockRepo.create).toHaveBeenCalledWith({ name: 'Alice' })
    expect(result).toEqual({ id: 1, name: 'Alice' })
  })

  it('未找到用户应该返回 null', async () => {
    mockRepo.findById.mockResolvedValue(null)

    const service = createUserService({ userRepo: mockRepo })
    const result = await service.findById(999)

    expect(result).toBeNull()
    expect(mockRepo.findById).toHaveBeenCalledWith(999)
  })
})
```

## 集成测试

### API 测试

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from './app'
import { setupDB, teardownDB } from './test-utils'

describe('User API', () => {
  beforeAll(async () => {
    await setupDB()
  })

  afterAll(async () => {
    await teardownDB()
  })

  it('GET /api/users 应该返回用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
  })

  it('POST /api/users 应该创建用户', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })
      .expect('Content-Type', /json/)
      .expect(201)

    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe('Alice')
  })

  it('POST /api/users 无效数据应该返回 400', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: '' })
      .expect(400)

    expect(response.body).toHaveProperty('error')
  })
})
```

## E2E 测试（Playwright）

```javascript
import { test, expect } from '@playwright/test'

test.describe('用户认证', () => {
  test('登录流程', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.welcome')).toBeVisible()
  })

  test('登出流程', async ({ page }) => {
    await login(page) // 辅助函数

    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/login')
  })
})
```

## 测试覆盖率

### 配置

```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.js'
      ],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80
    }
  }
}
```

### 运行

```bash
# 运行测试
npm test

# 带覆盖率
npm run test:coverage

# 监听模式
npm run test:watch

# E2E 测试
npx playwright test
```

## 必测场景

- [ ] 正常流程（Happy Path）
- [ ] 空值与可选参数
- [ ] 异常分支与错误处理
- [ ] 边界值（0, -1, MAX, 空数组）
- [ ] 异步流程失败场景
- [ ] 并发场景
- [ ] 网络错误

## 测试最佳实践

### 描述性命名

```javascript
// 差
it('test1', () => { ... })

// 好
it('当邮箱无效时应该返回错误', () => { ... })
```

### 单一职责

```javascript
// 差：一个测试验证多个行为
it('用户服务', async () => {
  const user = await service.create({ name: 'Alice' })
  expect(user.id).toBeDefined()
  const found = await service.findById(user.id)
  expect(found).toEqual(user)
  await service.delete(user.id)
  expect(await service.findById(user.id)).toBeNull()
})

// 好：每个测试验证一个行为
it('应该创建用户', async () => {
  const user = await service.create({ name: 'Alice' })
  expect(user.id).toBeDefined()
})

it('应该根据 ID 查找用户', async () => {
  const user = await service.create({ name: 'Alice' })
  const found = await service.findById(user.id)
  expect(found).toEqual(user)
})
```

### 测试隔离

```javascript
// 使用 beforeEach/afterEach 确保测试独立
describe('UserService', () => {
  let service

  beforeEach(async () => {
    await clearDatabase()
    service = new UserService()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  it('测试1', async () => { ... })
  it('测试2', async () => { ... })
})
```

## 代理支持

- **tdd-guide** - TDD 工作流指导
- **e2e-runner** - Playwright E2E 测试专家