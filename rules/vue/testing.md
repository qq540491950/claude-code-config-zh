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

## Vue 组件测试

使用 **Vitest** 进行单元测试：

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

## 组合式函数测试

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
})
```

## E2E 测试

使用 **Playwright** 进行端到端测试：

```typescript
import { test, expect } from '@playwright/test'

test('用户登录流程', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('.welcome')).toContainText('欢迎')
})
```

## 测试覆盖率

```bash
vitest run --coverage
```

## 代理支持

- **e2e-runner** - Playwright E2E 测试专家
