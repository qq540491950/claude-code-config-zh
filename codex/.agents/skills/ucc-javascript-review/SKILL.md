---
name: ucc-javascript-review
description: 全面的 JavaScript/TypeScript 代码审查，检查 ES6+ 惯用法、异步模式、类型安全和最佳实践。调用 javascript-reviewer 代理。
---

# ucc-javascript-review

This skill is migrated from legacy command `ucc-javascript-review` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-javascript-review`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# JavaScript/TypeScript 代码审查

此命令调用 **javascript-reviewer** 代理进行全面的 JavaScript/TypeScript 特定代码审查。

## 命令功能

1. **识别变更**：通过 `git diff` 查找修改的 `.js`、`.jsx`、`.ts`、`.tsx`、`.vue` 文件
2. **运行静态分析**：执行 `eslint`、`tsc --noEmit`、`prettier --check`
3. **安全扫描**：检查 XSS、原型污染、eval 使用
4. **类型安全审查**：分析 TypeScript 类型错误和 any 使用
5. **异步代码审查**：验证 Promise 和 async/await 最佳实践
6. **生成报告**：按严重程度分类问题

## 何时使用

以下情况使用 `$ucc-javascript-review`：
- 编写或修改 JavaScript/TypeScript 代码后
- 提交变更前
- 审查包含 JS/TS 代码的 Pull Request
- 入职新的 JavaScript/TypeScript 代码库
- 学习现代 JavaScript 模式

## 审查类别

### 关键（必须修复）
- XSS 漏洞（innerHTML 用户输入）
- 原型污染风险
- eval 使用
- 硬编码密钥
- 未处理的 Promise 拒绝
- 空错误处理

### 高优先级（应该修复）
- TypeScript any 类型使用
- 缺少类型注解
- 闭包陷阱
- this 绑定问题
- 回调地狱
- async 函数缺失 await
- 事件监听器内存泄漏

### 中优先级（考虑）
- 使用 var 而非 const/let
- 字符串拼接而非模板字符串
- 缺少可选链/空值合并
- console.log 遗留
- 深层对象访问未使用可选链

## 自动检查

```bash
# TypeScript 类型检查
npx tsc --noEmit

# ESLint 检查
npx eslint . --max-warnings 0

# 格式检查
npx prettier --check .

# 依赖安全
npm audit

# 测试和覆盖率
npm run test:coverage
```

## 批准标准

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 | 无关键或高优先级问题 |
| ⚠️ 警告 | 仅有中优先级问题（可谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |

## 框架特定审查

### React 项目
审查器检查：
- useEffect 依赖数组正确性
- key 属性在列表中存在
- state 不可变性
- memo/useMemo/useCallback 优化
- 条件渲染中的 hooks 调用

### Vue 项目
审查器检查：
- 响应式数据正确使用
- props 类型验证
- 组件生命周期使用
- v-for 中 key 属性
- v-html 安全性

### Node.js 项目
审查器检查：
- 错误处理中间件
- 环境变量验证
- 连接池管理
- 异步错误处理
- 安全头配置

## 与其他命令集成

- 先用 `$ucc-tdd` 确保测试通过
- 非 JS/TS 特定问题用 `$ucc-code-review`
- 提交前用 `$ucc-javascript-review`
- 如静态分析工具失败用 `$ucc-build-fix`

## 相关

- 代理：`agents/javascript-reviewer.md`
- 技能：`skills/javascript-patterns/`、`skills/node-backend-patterns/`

## 常见修复

### 修复闭包陷阱
```javascript
// 之前
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}

// 之后
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
```

### 使用可选链
```javascript
// 之前
const name = user && user.profile && user.profile.name

// 之后
const name = user?.profile?.name
```

### 正确处理 Promise
```javascript
// 之前
async function fetchData() {
  const data = await fetch(url)
  return data.json()
}

// 之后
async function fetchData() {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw error
  }
}
```

### 使用空值合并
```javascript
// 之前
const value = input || 'default' // 0, '' 会使用 default

// 之后
const value = input ?? 'default' // 只有 null, undefined 使用 default
```

### 避免原型污染
```javascript
// 危险
function merge(target, source) {
  for (const key in source) {
    target[key] = source[key]
  }
}

// 安全
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype']
function safeMerge(target, source) {
  for (const key in source) {
    if (DANGEROUS_KEYS.includes(key)) continue
    target[key] = source[key]
  }
}
```

### TypeScript 类型守卫
```typescript
// 之前
function process(value: any) {
  return value.name.toUpperCase()
}

// 之后
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'name' in value
}

function process(value: unknown) {
  if (isUser(value)) {
    return value.name.toUpperCase()
  }
  throw new Error('Invalid user')
}
```

### React useEffect 依赖
```javascript
// 错误
useEffect(() => {
  fetchData(userId)
}, []) // userId 变化时不重新获取

// 正确
useEffect(() => {
  fetchData(userId)
}, [userId])
```

### Vue 响应式更新
```javascript
// 错误
this.user.name = 'Alice'

// 正确
this.user = { ...this.user, name: 'Alice' }
```
