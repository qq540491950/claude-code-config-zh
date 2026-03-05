---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 设计模式

> 此文件扩展 [common/patterns.md](../common/patterns.md) 添加 JavaScript 特定内容。

## 异步模式

### 错误边界

```javascript
async function safeRun(task) {
  try {
    return await task()
  } catch (error) {
    throw new Error(`执行失败: ${String(error)}`)
  }
}

// 使用
const result = await safeRun(() => fetchData(id))
```

### 重试模式

```javascript
async function retry(fn, { attempts = 3, delay = 1000 } = {}) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// 使用
const data = await retry(() => fetchFromAPI(url), { attempts: 3, delay: 500 })
```

### 并发控制

```javascript
async function limitConcurrency(tasks, limit = 3) {
  const results = []
  const executing = new Set()

  for (const task of tasks) {
    const promise = task().then(result => {
      executing.delete(promise)
      return result
    })
    executing.add(promise)
    results.push(promise)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  return Promise.all(results)
}
```

## 函数式模式

### 防抖（Debounce）

```javascript
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 使用
const debouncedSearch = debounce(search, 500)
input.addEventListener('input', debouncedSearch)
```

### 节流（Throttle）

```javascript
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
const throttledScroll = throttle(handleScroll, 100)
window.addEventListener('scroll', throttledScroll)
```

### 记忆化（Memoization）

```javascript
function memoize(fn) {
  const cache = new Map()
  return function (...args) {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

// 使用
const expensiveCalculation = memoize((n) => {
  // 复杂计算
  return result
})
```

### 函数组合

```javascript
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x)
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x)

// 使用
const processText = pipe(
  trim,
  toLowerCase,
  split(' ')
)
processText('  HELLO WORLD  ') // ['hello', 'world']
```

## 对象模式

### 工厂函数

```javascript
function createUser({ name, email }) {
  let _email = email

  return {
    name,
    get email() { return _email },
    set email(value) {
      if (!value.includes('@')) throw new Error('无效邮箱')
      _email = value
    },
    toString() {
      return `${name} <${_email}>`
    }
  }
}
```

### 依赖注入

```javascript
function createUserService({ userRepo, logger }) {
  return {
    async create(input) {
      const user = await userRepo.create(input)
      logger.info('user-created', { id: user.id })
      return user
    },
    async findById(id) {
      const user = await userRepo.findById(id)
      if (!user) {
        logger.warn('user-not-found', { id })
        return null
      }
      return user
    }
  }
}

// 测试时注入 mock
const mockRepo = { create: jest.fn() }
const mockLogger = { info: jest.fn() }
const service = createUserService({ userRepo: mockRepo, logger: mockLogger })
```

## 模块模式

### 揭示模块模式

```javascript
const counter = (function () {
  let count = 0

  function increment() {
    count++
    return count
  }

  function decrement() {
    count--
    return count
  }

  function getCount() {
    return count
  }

  return { increment, decrement, getCount }
})()
```

### 单例模式

```javascript
const Singleton = (function () {
  let instance

  function createInstance() {
    return { id: Date.now(), data: {} }
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance()
      }
      return instance
    }
  }
})()
```

## 请求参数校验

```javascript
function validatePagination(query) {
  const limit = Number(query.limit ?? 20)
  const page = Number(query.page ?? 1)

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    throw new Error('limit 必须是 1-100 的整数')
  }
  if (!Number.isInteger(page) || page <= 0) {
    throw new Error('page 必须是正整数')
  }

  return { limit, page, offset: (page - 1) * limit }
}

// 使用
const { limit, page, offset } = validatePagination(req.query)
```

## 发布订阅模式

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(handler)
    return () => this.off(event, handler)
  }

  off(event, handler) {
    this.events.get(event)?.delete(handler)
  }

  emit(event, data) {
    this.events.get(event)?.forEach(handler => handler(data))
  }
}

// 使用
const events = new EventEmitter()
const unsubscribe = events.on('user-created', user => {
  sendWelcomeEmail(user)
})
events.emit('user-created', { id: 1, email: 'user@example.com' })
unsubscribe()
```

## 参考

详见技能：`javascript-patterns` 获取完整的 JavaScript 模式示例。