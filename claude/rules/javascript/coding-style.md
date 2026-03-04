---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 JavaScript/Node 特定内容。

## 可读性

- 函数保持短小，避免超过 50 行
- 优先提前返回，减少深层嵌套
- 变量命名语义化，避免 `tmp/data/x` 等弱语义命名

## 模块与导入

- 导入按"内置模块 / 第三方 / 本地模块"分组
- 删除未使用导入
- 新文件默认使用项目现有模块系统（ESM/CJS）

```javascript
// 推荐：按顺序分组
import fs from 'fs'                    // 内置模块
import express from 'express'          // 第三方模块
import { userService } from './services'  // 本地模块
```

## 不可变性

优先返回新对象，避免原地修改：

```javascript
// 错误
state.list.push(item)

// 正确
const nextState = {
  ...state,
  list: [...state.list, item],
}

// 数组操作
const filtered = arr.filter(x => x.active)
const mapped = arr.map(x => ({ ...x, processed: true }))
```

## 异步处理

### async/await 优先

```javascript
// 推荐
async function fetchData(id) {
  try {
    const response = await fetch(`/api/data/${id}`)
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('获取数据失败:', error)
    throw error
  }
}

// 避免：回调地狱
function fetchData(id, callback) {
  fetch(`/api/data/${id}`, (err, response) => {
    if (err) return callback(err)
    response.json((err, data) => {
      if (err) return callback(err)
      callback(null, data)
    })
  })
}
```

### Promise 错误处理

```javascript
// 推荐：始终处理错误
async function processItems(items) {
  const results = await Promise.allSettled(
    items.map(item => processItem(item))
  )

  const fulfilled = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value)

  const rejected = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason)

  if (rejected.length > 0) {
    console.warn('部分处理失败:', rejected)
  }

  return fulfilled
}

// 避免：未处理的 Promise 拒绝
Promise.all(items.map(processItem)) // 如果一个失败，全部失败
```

## 闭包陷阱

### 循环中的闭包

```javascript
// 错误：闭包陷阱
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 3, 3, 3

// 正确：使用 let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出: 0, 1, 2

// 正确：使用 IIFE
for (var i = 0; i < 3; i++) {
  ((j) => {
    setTimeout(() => console.log(j), 100)
  })(i)
}
```

## this 绑定

```javascript
class Counter {
  constructor() {
    this.count = 0
    // 推荐：在构造函数中绑定
    this.increment = this.increment.bind(this)
  }

  // 或者使用箭头函数
  decrement = () => {
    this.count--
  }

  increment() {
    this.count++
  }
}
```

## 事件循环理解

```javascript
// 理解执行顺序
console.log('1. 同步开始')

setTimeout(() => console.log('2. 宏任务 setTimeout'), 0)

Promise.resolve().then(() => console.log('3. 微任务 Promise'))

queueMicrotask(() => console.log('4. 微任务 queueMicrotask'))

console.log('5. 同步结束')

// 输出顺序: 1, 5, 3, 4, 2
// 同步代码 → 微任务队列 → 宏任务队列
```

## 解构与默认值

```javascript
// 推荐：函数参数解构
function createUser({ name, age = 0, role = 'user' }) {
  return { name, age, role }
}

// 调用
createUser({ name: 'Alice' }) // { name: 'Alice', age: 0, role: 'user' }

// 数组解构
const [first, second, ...rest] = items

// 重命名解构
const { oldName: newName } = obj
```

## 调试语句

- 生产代码不得保留 `console.log`
- 使用项目约定日志接口并区分日志级别

```javascript
// 开发环境
if (process.env.NODE_ENV === 'development') {
  console.debug('调试信息:', data)
}

// 推荐：使用日志库
import { logger } from './logger'
logger.info('操作完成', { userId, action })
```

## 参考

详见技能：`javascript-patterns` 获取完整的 JavaScript 模式示例。