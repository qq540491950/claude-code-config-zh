---
name: javascript-patterns
description: JavaScript 核心模式与最佳实践，涵盖异步处理、函数式编程、闭包陷阱、设计模式。
---

# JavaScript 核心模式

适用于 JavaScript/Node.js 项目，帮助开发者避开常见陷阱，编写可维护的代码。

## 何时激活

- 编写 JavaScript 业务逻辑
- 处理异步操作
- 重构遗留代码
- 排查闭包/this 相关问题

## 1. 异步处理模式

### async/await 最佳实践

```javascript
// 推荐：清晰的错误处理
async function fetchUserData(userId) {
  try {
    const user = await fetchUser(userId)
    const orders = await fetchOrders(user.id)
    return { user, orders }
  } catch (error) {
    console.error('获取用户数据失败:', error)
    throw new Error(`获取用户数据失败: ${error.message}`)
  }
}

// 推荐：并行执行独立操作
async function fetchDashboardData(userId) {
  const [user, notifications, stats] = await Promise.all([
    fetchUser(userId),
    fetchNotifications(userId),
    fetchStats(userId)
  ])
  return { user, notifications, stats }
}
```

### Promise.allSettled 处理部分失败

```javascript
async function processBatch(items) {
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  )

  const succeeded = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason)

  if (failed.length > 0) {
    console.warn('部分处理失败:', failed)
  }

  return { succeeded, failed }
}
```

### 重试模式

```javascript
async function withRetry(fn, options = {}) {
  const { attempts = 3, delay = 1000, backoff = 2 } = options

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error

      const waitTime = delay * Math.pow(backoff, i)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
}

// 使用
const data = await withRetry(() => fetchFromAPI(url), {
  attempts: 3,
  delay: 500,
  backoff: 2
})
```

## 2. 闭包与作用域

### 循环中的闭包陷阱

```javascript
// 陷阱：所有回调输出相同的值
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 3, 3, 3

// 解决方案 1：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 0, 1, 2

// 解决方案 2：IIFE
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100)
  })(i)
}

// 解决方案 3：forEach
[0, 1, 2].forEach(i => {
  setTimeout(() => console.log(i), 100)
})
```

### 私有变量模式

```javascript
function createCounter() {
  let count = 0 // 私有变量

  return {
    increment() { return ++count },
    decrement() { return --count },
    get() { return count }
  }
}

const counter = createCounter()
counter.increment() // 1
counter.increment() // 2
counter.get()       // 2
// count 不可直接访问
```

## 3. this 绑定

### 理解 this

```javascript
const obj = {
  name: 'Alice',

  // 正确：箭头函数继承外层 this
  greet: function() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`) // 'Hello, Alice'
    }, 100)
  },

  // 陷阱：普通函数丢失 this
  greetWrong: function() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`) // 'Hello, undefined'
    }, 100)
  }
}

// 解决方案：bind
obj.greetWrong = function() {
  setTimeout(function() {
    console.log(`Hello, ${this.name}`)
  }.bind(this), 100)
}
```

### 类方法绑定

```javascript
class EventEmitter {
  constructor() {
    this.handlers = new Map()

    // 方案 1：构造函数中 bind
    this.emit = this.emit.bind(this)
  }

  // 方案 2：箭头函数类字段
  on = (event, handler) => {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event).add(handler)
  }

  emit(event, data) {
    this.handlers.get(event)?.forEach(h => h(data))
  }
}
```

## 4. 函数式编程

### 纯函数

```javascript
// 纯函数：相同输入永远得到相同输出，无副作用
function add(a, b) {
  return a + b
}

// 非纯函数：依赖外部状态
let total = 0
function addToTotal(value) {
  total += value // 修改外部状态
  return total
}

// 纯函数版本
function createAccumulator(initial = 0) {
  let sum = initial
  return {
    add(value) {
      sum += value
      return sum
    },
    get() { return sum }
  }
}
```

### 不可变操作

```javascript
// 数组操作
const add = (arr, item) => [...arr, item]
const remove = (arr, index) => [...arr.slice(0, index), ...arr.slice(index + 1)]
const update = (arr, index, item) => arr.map((v, i) => i === index ? item : v)

// 对象操作
const setKey = (obj, key, value) => ({ ...obj, [key]: value })
const removeKey = (obj, key) => {
  const { [key]: _, ...rest } = obj
  return rest
}

// 深度更新
const updateNested = (obj, path, value) => {
  if (path.length === 0) return value
  const [head, ...tail] = path
  return {
    ...obj,
    [head]: updateNested(obj[head] || {}, tail, value)
  }
}
```

### 函数组合

```javascript
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

// 使用示例
const processUser = pipe(
  user => ({ ...user, name: user.name.trim() }),
  user => ({ ...user, email: user.email.toLowerCase() }),
  user => ({ ...user, initials: user.name.split(' ').map(n => n[0]).join('') })
)

processUser({ name: '  Alice Smith  ', email: 'ALICE@EXAMPLE.COM' })
// { name: 'Alice Smith', email: 'alice@example.com', initials: 'AS' }
```

## 5. 工具函数模式

### 防抖与节流

```javascript
// 防抖：延迟执行，重复调用重置计时
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 节流：限制执行频率
function throttle(fn, limit = 300) {
  let inThrottle = false
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 使用
const debouncedSearch = debounce(search, 500)
const throttledScroll = throttle(handleScroll, 100)
```

### 记忆化

```javascript
function memoize(fn, getKey = JSON.stringify) {
  const cache = new Map()

  return function (...args) {
    const key = getKey(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// 使用
const fibonacci = memoize((n) => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})
```

## 6. 错误处理模式

### Result 类型

```javascript
// 使用 Result 类型替代异常
const Result = {
  ok: (value) => ({ success: true, value }),
  error: (error) => ({ success: false, error }),

  map: (result, fn) => {
    if (result.success) {
      try {
        return Result.ok(fn(result.value))
      } catch (e) {
        return Result.error(e.message)
      }
    }
    return result
  },

  flatMap: (result, fn) => {
    if (result.success) {
      return fn(result.value)
    }
    return result
  }
}

// 使用
function divide(a, b) {
  if (b === 0) return Result.error('除数不能为零')
  return Result.ok(a / b)
}

const result = divide(10, 2)
if (result.success) {
  console.log(result.value) // 5
} else {
  console.error(result.error)
}
```

## 检查清单

- [ ] 异步操作有错误处理
- [ ] 避免闭包陷阱（循环中使用 let 或 IIFE）
- [ ] this 绑定正确（箭头函数或 bind）
- [ ] 使用不可变操作更新数据
- [ ] 纯函数优先，副作用隔离
- [ ] 防抖/节流处理高频事件

## 参考

- `rules/javascript/` - JavaScript 规则
- `node-backend-patterns` - Node.js 后端模式
