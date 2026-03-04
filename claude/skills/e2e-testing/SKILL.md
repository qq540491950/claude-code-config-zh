---
name: e2e-testing
description: Playwright E2E 测试模式、Page Object Model、配置、CI/CD 集成、产物管理和不稳定测试策略。
origin: ECC
---

# E2E 测试模式

构建稳定、快速、可维护的 E2E 测试套件的 Playwright 综合模式。

## 测试文件组织

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── register.spec.ts
│   ├── features/
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   └── create.spec.ts
│   └── api/
│       └── endpoints.spec.ts
├── fixtures/
│   ├── auth.ts
│   └── data.ts
└── playwright.config.ts
```

## Page Object Model (POM)

```typescript
import { Page, Locator } from '@playwright/test'

export class ItemsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly itemCards: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.itemCards = page.locator('[data-testid="item-card"]')
    this.createButton = page.locator('[data-testid="create-btn"]')
  }

  async goto() {
    await this.page.goto('/items')
    await this.page.waitForLoadState('networkidle')
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp => resp.url().includes('/api/search'))
    await this.page.waitForLoadState('networkidle')
  }

  async getItemCount() {
    return await this.itemCards.count()
  }
}
```

## 测试结构

```typescript
import { test, expect } from '@playwright/test'
import { ItemsPage } from '../../pages/ItemsPage'

test.describe('商品搜索', () => {
  let itemsPage: ItemsPage

  test.beforeEach(async ({ page }) => {
    itemsPage = new ItemsPage(page)
    await itemsPage.goto()
  })

  test('应该能按关键词搜索', async ({ page }) => {
    await itemsPage.search('测试')

    const count = await itemsPage.getItemCount()
    expect(count).toBeGreaterThan(0)

    await expect(itemsPage.itemCards.first()).toContainText(/测试/i)
    await page.screenshot({ path: 'artifacts/search-results.png' })
  })

  test('应该正确处理无结果', async ({ page }) => {
    await itemsPage.search('xyz不存在123')

    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    expect(await itemsPage.getItemCount()).toBe(0)
  })
})
```

## Playwright 配置

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['json', { outputFile: 'playwright-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

## 不稳定测试模式

### 隔离不稳定测试

```typescript
test('不稳定: 复杂搜索', async ({ page }) => {
  test.fixme(true, '不稳定 - Issue #123')
  // 测试代码...
})

test('条件跳过', async ({ page }) => {
  test.skip(process.env.CI, 'CI 中不稳定 - Issue #123')
  // 测试代码...
})
```

### 识别不稳定性

```bash
npx playwright test tests/search.spec.ts --repeat-each=10
npx playwright test tests/search.spec.ts --retries=3
```

### 常见原因与修复

**竞态条件：**
```typescript
// 错误：假设元素已准备好
await page.click('[data-testid="button"]')

// 正确：自动等待的 locator
await page.locator('[data-testid="button"]').click()
```

**网络时序：**
```typescript
// 错误：任意超时
await page.waitForTimeout(5000)

// 正确：等待特定条件
await page.waitForResponse(resp => resp.url().includes('/api/data'))
```

**动画时序：**
```typescript
// 错误：动画期间点击
await page.click('[data-testid="menu-item"]')

// 正确：等待稳定
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

## 产物管理

### 截图

```typescript
await page.screenshot({ path: 'artifacts/after-login.png' })
await page.screenshot({ path: 'artifacts/full-page.png', fullPage: true })
await page.locator('[data-testid="chart"]').screenshot({ path: 'artifacts/chart.png' })
```

### 追踪

```typescript
await browser.startTracing(page, {
  path: 'artifacts/trace.json',
  screenshots: true,
  snapshots: true,
})
// ... 测试操作 ...
await browser.stopTracing()
```

### 视频

```typescript
// 在 playwright.config.ts 中
use: {
  video: 'retain-on-failure',
  videosPath: 'artifacts/videos/'
}
```

## CI/CD 集成

```yaml
# .github/workflows/e2e.yml
name: E2E 测试
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 测试报告模板

```markdown
# E2E 测试报告

**日期：** YYYY-MM-DD HH:MM
**时长：** Xm Ys
**状态：** 通过 / 失败

## 概要
- 总计：X | 通过：Y (Z%) | 失败：A | 不稳定：B | 跳过：C

## 失败测试

### test-name
**文件：** `tests/e2e/feature.spec.ts:45`
**错误：** 期望元素可见
**截图：** artifacts/failed.png
**建议修复：** [描述]

## 产物
- HTML 报告：playwright-report/index.html
- 截图：artifacts/*.png
- 视频：artifacts/videos/*.webm
- 追踪：artifacts/*.zip
```

## 测试最佳实践

### 使用 data-testid

```html
<!-- 推荐 -->
<button data-testid="submit-btn">提交</button>
<input data-testid="email-input" type="email" />
```

```typescript
// 测试中使用
await page.locator('[data-testid="submit-btn"]').click()
```

### 避免硬编码等待

```typescript
// 错误
await page.waitForTimeout(3000)

// 正确
await expect(page.locator('[data-testid="result"]')).toBeVisible()
```

### 测试隔离

```typescript
test.beforeEach(async ({ page }) => {
  // 每个测试前的设置
  await page.goto('/')
})

test.afterEach(async ({ page }) => {
  // 每个测试后的清理
  await page.context().clearCookies()
})
```
