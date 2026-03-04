---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 安全规范

> 此文件扩展 [common/security.md](../common/security.md) 添加 JavaScript/Node 特定内容。

## 输入验证

### 参数验证

```javascript
// 所有外部输入必须验证
function validateId(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error('无效的 ID 格式')
  }
  return id
}

function validateEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) {
    throw new Error('无效的邮箱格式')
  }
  return email.toLowerCase()
}
```

### 请求体验证

```javascript
function validateUserInput(body) {
  const { name, email, age } = body

  if (!name || typeof name !== 'string' || name.length > 100) {
    throw new Error('name 必须是 1-100 字符的字符串')
  }

  if (!email || typeof email !== 'string') {
    throw new Error('email 是必填项')
  }

  if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 150)) {
    throw new Error('age 必须是 0-150 的整数')
  }

  return { name, email: validateEmail(email), age }
}
```

## SQL 注入防护

```javascript
// 错误：SQL 注入风险
const query = `SELECT * FROM users WHERE id = '${userId}'`

// 正确：参数化查询（使用 pg）
const query = 'SELECT * FROM users WHERE id = $1'
const result = await db.query(query, [userId])

// 正确：使用 ORM
const user = await User.query().where('id', userId).first()
```

## XSS 防护

### 前端防护

```javascript
// 错误：直接插入 HTML
element.innerHTML = userInput

// 正确：使用 textContent
element.textContent = userInput

// 必须使用 HTML 时，进行清理
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
})
```

### 后端防护

```javascript
// 设置安全响应头
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Content-Security-Policy', "default-src 'self'")
  next()
})
```

## 原型污染防护

```javascript
// 危险：原型污染
function merge(target, source) {
  for (const key in source) {
    target[key] = source[key]
  }
  return target
}

merge({}, JSON.parse('{ "__proto__": { "admin": true } }'))

// 安全：检查危险键
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype']

function safeMerge(target, source) {
  for (const key in source) {
    if (DANGEROUS_KEYS.includes(key)) continue
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
```

## 密钥管理

```javascript
// 永远不要：硬编码密钥
const apiKey = 'sk-proj-xxxxx'
const dbPassword = 'password123'

// 始终：使用环境变量
const apiKey = process.env.API_KEY
const dbPassword = process.env.DB_PASSWORD

// 启动时验证
function validateEnv() {
  const required = ['API_KEY', 'DB_PASSWORD', 'JWT_SECRET']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`环境变量 ${key} 未配置`)
    }
  }
}

// Node.js 早期执行
validateEnv()
```

## 错误处理

```javascript
// 错误：暴露敏感信息
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id)
    res.json(user)
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack  // 危险！
    })
  }
})

// 正确：隐藏敏感信息
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await getUser(req.params.id)
    res.json(user)
  } catch (error) {
    console.error('获取用户失败:', error)
    res.status(500).json({
      error: '服务器内部错误',
      requestId: req.id
    })
  }
})
```

## 认证与授权

### JWT 安全

```javascript
const jwt = require('jsonwebtoken')

// 生成 token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
}

// 验证 token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: '未认证' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token 无效或已过期' })
  }
}

// 权限检查
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: '权限不足' })
    }
    next()
  }
}
```

## 依赖安全

```bash
# 检查已知漏洞
npm audit

# 自动修复
npm audit fix

# 使用 npm 8+
npm audit fix --force
```

## 安全检查清单

- [ ] 无硬编码密钥
- [ ] 使用环境变量存储敏感信息
- [ ] 所有用户输入已验证
- [ ] 参数化数据库查询
- [ ] XSS 防护（转义/清理）
- [ ] CSRF 防护
- [ ] 错误响应不泄露敏感信息
- [ ] JWT 有效期合理
- [ ] 依赖无已知漏洞
- [ ] 安全响应头已设置

## 代理支持

- 使用 **security-reviewer** 技能进行全面安全审计