---
name: tdd-workflow
description: 测试驱动开发工作流，确保 80%+ 测试覆盖率和先测试后实现。
---

# TDD 工作流

测试驱动开发（TDD）专家技能，确保所有代码以测试优先方式开发。

## 何时激活

- 编写新功能
- 修复 Bug
- 重构代码
- 添加新的函数/组件
- 构建关键业务逻辑

## TDD 循环

```
红 → 绿 → 重构 → 重复

红（RED）：      编写失败的测试
绿（GREEN）：    编写最小代码使其通过
重构（REFACTOR）：改进代码，保持测试通过
重复（REPEAT）：   下一个功能/场景
```

## 工作流程

### 第 1 步：定义接口（搭建）

```typescript
// 先定义类型/接口
export interface MarketData {
  totalVolume: number
  bidAskSpread: number
  activeTraders: number
}

export function calculateLiquidityScore(market: MarketData): number {
  // TODO: 实现
  throw new Error('未实现')
}
```

### 第 2 步：编写失败的测试（红）

```typescript
describe('calculateLiquidityScore', () => {
  it('高流动性市场应返回高分', () => {
    const market = {
      totalVolume: 100000,
      bidAskSpread: 0.01,
      activeTraders: 500,
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeGreaterThan(80)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('低流动性市场应返回低分', () => {
    const market = {
      totalVolume: 100,
      bidAskSpread: 0.5,
      activeTraders: 2,
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBeLessThan(30)
    expect(score).toBeGreaterThanOrEqual(0)
  })

  it('应处理边缘情况：零交易量', () => {
    const market = {
      totalVolume: 0,
      bidAskSpread: 0,
      activeTraders: 0,
    }

    const score = calculateLiquidityScore(market)

    expect(score).toBe(0)
  })
})
```

### 第 3 步：运行测试 - 验证失败

```bash
npm test

FAIL
  ✕ 高流动性市场应返回高分
    Error: 未实现

1 测试失败, 0 通过
```

✅ 测试按预期失败。准备实现。

### 第 4 步：实现最小代码（绿）

```typescript
export function calculateLiquidityScore(market: MarketData): number {
  // 处理零交易量边缘情况
  if (market.totalVolume === 0) {
    return 0
  }

  // 计算各部分分数（0-100 刻度）
  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = Math.max(100 - (market.bidAskSpread * 1000), 0)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  // 加权平均
  const score = (
    volumeScore * 0.4 +
    spreadScore * 0.3 +
    traderScore * 0.3
  )

  return Math.min(Math.max(score, 0), 100) // 限制在 0-100
}
```

### 第 5 步：运行测试 - 验证通过

```bash
npm test

PASS
  ✓ 高流动性市场应返回高分 (3 ms)
  ✓ 低流动性市场应返回低分 (2 ms)
  ✓ 应处理边缘情况：零交易量 (1 ms)

3 测试通过
```

✅ 所有测试通过！

### 第 6 步：重构（改进）

```typescript
// 重构后：使用常量和更好的可读性
const WEIGHTS = {
  VOLUME: 0.4,
  SPREAD: 0.3,
  TRADERS: 0.3,
} as const

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function calculateLiquidityScore(market: MarketData): number {
  if (market.totalVolume === 0) return 0

  const volumeScore = Math.min(market.totalVolume / 1000, 100)
  const spreadScore = clamp(100 - (market.bidAskSpread * 1000), 0, 100)
  const traderScore = Math.min(market.activeTraders / 10, 100)

  const weightedScore =
    volumeScore * WEIGHTS.VOLUME +
    spreadScore * WEIGHTS.SPREAD +
    traderScore * WEIGHTS.TRADERS

  return clamp(weightedScore, 0, 100)
}
```

### 第 7 步：验证测试仍然通过

```bash
npm test

PASS
  ✓ 高流动性市场应返回高分 (3 ms)
  ✓ 低流动性市场应返回低分 (2 ms)
  ✓ 应处理边缘情况：零交易量 (1 ms)

3 测试通过
```

✅ 重构完成，测试仍然通过！

### 第 8 步：检查覆盖率

```bash
npm test -- --coverage

File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
liquidity.ts   |   100   |   100    |   100   |   100

覆盖率: 100% ✅ (目标: 80%)
```

## 测试类型

### 单元测试

```typescript
// 函数级测试
describe('formatCurrency', () => {
  it('应正确格式化正数', () => {
    expect(formatCurrency(1234.56)).toBe('¥1,234.56')
  })

  it('应处理零', () => {
    expect(formatCurrency(0)).toBe('¥0.00')
  })

  it('应处理负数', () => {
    expect(formatCurrency(-100)).toBe('-¥100.00')
  })
})
```

### 集成测试

```typescript
// API 端点测试
describe('POST /api/users', () => {
  it('应创建新用户', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'alice@example.com' })

    expect(response.status).toBe(201)
    expect(response.body.user.name).toBe('Alice')
  })

  it('应拒绝无效邮箱', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Alice', email: 'invalid' })

    expect(response.status).toBe(400)
  })
})
```

### E2E 测试

```typescript
// 用户流程测试
test('用户登录流程', async ({ page }) => {
  await page.goto('/login')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
})
```

## 边缘情况检查清单

**必须测试：**

- [ ] Null/Undefined 输入
- [ ] 空数组/字符串
- [ ] 无效类型传入
- [ ] 边界值（最小/最大）
- [ ] 错误路径（网络失败、数据库错误）
- [ ] 大数据（10k+ 项目性能）
- [ ] 特殊字符（Unicode、表情、SQL 字符）

## 测试反模式

**避免：**

- ❌ 测试实现细节（内部状态）而非行为
- ❌ 测试相互依赖（共享状态）
- ❌ 断言太少（通过但不验证任何东西）
- ❌ 不模拟外部依赖

**推荐：**

- ✅ 测试公共 API 和行为
- ✅ 每个测试独立
- ✅ 有意义的断言
- ✅ 模拟外部服务

## 覆盖率要求

| 代码类型 | 最低覆盖率 |
|---------|----------|
| 所有代码 | 80% |
| 财务计算 | 100% |
| 认证逻辑 | 100% |
| 安全关键代码 | 100% |
| 核心业务逻辑 | 100% |

## 常用命令

```bash
# 运行测试
npm test
pytest
go test ./...

# 运行覆盖率
npm test -- --coverage
pytest --cov=src
go test -cover ./...

# 监视模式
npm test -- --watch
pytest --watch
```

**记住**：测试必须在实现之前编写。永不跳过红阶段。
