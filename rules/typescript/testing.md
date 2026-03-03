---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.vue"
---
# TypeScript/Vue 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 TypeScript/Vue 特定内容。

## 测试框架

| 类型 | 推荐工具 |
|------|---------|
| 单元测试 | Vitest / Jest |
| 组件测试 | Vue Test Utils |
| E2E 测试 | Playwright |

## TDD 工作流

1. **红**：先写失败测试
2. **绿**：最小实现让测试通过
3. **重构**：优化代码并保持测试通过

## Vue 组件测试

### 基础组件测试

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  it('显示用户名称', () => {
    const wrapper = mount(UserCard, {
      props: {
        user: { id: '1', name: 'Alice', email: 'alice@example.com' }
      }
    })

    expect(wrapper.text()).toContain('Alice')
  })

  it('点击时发出 select 事件', async () => {
    const wrapper = mount(UserCard, {
      props: {
        user: { id: '1', name: 'Alice', email: 'alice@example.com' }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')[0]).toEqual(['1'])
  })
})
```

### 带插槽的组件测试

```typescript
it('渲染默认插槽', () => {
  const wrapper = mount(Card, {
    slots: {
      default: '<p>插槽内容</p>'
    }
  })

  expect(wrapper.html()).toContain('插槽内容')
})
```

### Mock 外部依赖

```typescript
import { vi } from 'vitest'

// Mock API 调用
vi.mock('@/api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' })
}))

it('加载用户数据', async () => {
  const wrapper = mount(UserProfile)

  await wrapper.vm.$nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))

  expect(wrapper.text()).toContain('Alice')
})
```

## Composables 测试

```typescript
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('初始化计数', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('增加计数', () => {
    const { count, increment } = useCounter(0)
    increment()
    expect(count.value).toBe(1)
  })

  it('减少计数', () => {
    const { count, decrement } = useCounter(5)
    decrement()
    expect(count.value).toBe(4)
  })
})
```

## TypeScript 类型测试

```typescript
import { describe, it, expectTypeOf } from 'vitest'

describe('类型检查', () => {
  it('Result 类型正确', () => {
    type Result<T> =
      | { ok: true; data: T }
      | { ok: false; error: string }

    expectTypeOf<{ ok: true; data: number }>().toMatchTypeOf<Result<number>>()
    expectTypeOf<{ ok: false; error: string }>().toMatchTypeOf<Result<never>>()
  })
})
```

## E2E 测试（Playwright）

```typescript
import { test, expect } from '@playwright/test'

test.describe('用户认证', () => {
  test('登录流程', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('.welcome')).toContainText('欢迎')
  })

  test('登出流程', async ({ page }) => {
    // 先登录
    await login(page)

    // 点击登出
    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/login')
  })
})

test.describe('用户管理', () => {
  test('创建用户', async ({ page }) => {
    await page.goto('/users/new')

    await page.fill('[name="name"]', 'New User')
    await page.fill('[name="email"]', 'new@example.com')
    await page.click('button[type="submit"]')

    await expect(page.locator('.toast')).toContainText('创建成功')
  })
})
```

## 测试覆盖率

### 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
})
```

### 运行

```bash
# 运行测试
npm run test

# 带覆盖率
npm run test:coverage

# E2E 测试
npx playwright test
```

## 必测场景

- [ ] 空值与可选参数
- [ ] 异常分支与错误处理
- [ ] 边界值（0, -1, MAX）
- [ ] 异步流程失败场景
- [ ] 组件交互（事件、插槽）
- [ ] 路由跳转

## 代理支持

- **tdd-guide** - TDD 工作流指导
- **e2e-runner** - Playwright E2E 测试专家