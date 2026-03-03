---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.vue"
---
# TypeScript/Vue 安全规范

> 此文件扩展 [common/security.md](../common/security.md) 添加 TypeScript/Vue 特定内容。

## 密钥管理

```typescript
// 永远不要：硬编码密钥
const apiKey = "sk-proj-xxxxx"

// 始终：使用环境变量
const apiKey = import.meta.env.VITE_API_KEY

if (!apiKey) {
  throw new Error('VITE_API_KEY 未配置')
}
```

## 输入验证

### Zod 验证

```typescript
import { z } from 'zod'

// 前端验证
const formSchema = z.object({
  email: z.string().email('请输入有效的邮箱'),
  password: z.string().min(8, '密码至少8个字符'),
  age: z.number().min(0).max(150)
})

type FormData = z.infer<typeof formSchema>

function validateForm(data: unknown): FormData {
  return formSchema.parse(data)
}
```

### API 参数验证

```typescript
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string().uuid(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
})

app.get('/api/users', (req, res) => {
  const params = paramsSchema.parse(req.query)
  // 安全使用 params
})
```

## XSS 防护

### Vue 模板安全

```vue
<script setup lang="ts">
// Vue 自动转义 HTML，但要注意 v-html
const userContent = ref('<script>alert("xss")</script>')
</script>

<template>
  <!-- 安全：自动转义 -->
  <p>{{ userContent }}</p>

  <!-- 危险：可能 XSS -->
  <div v-html="userContent"></div>
</template>
```

### 使用 DOMPurify

```typescript
import DOMPurify from 'dompurify'

// 清理用户输入的 HTML
const cleanHtml = DOMPurify.sanitize(userInput)

// 允许特定标签
const cleanHtml = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
})
```

## API 请求安全

### 认证拦截器

```typescript
import axios from 'axios'

// 请求拦截器：添加认证
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 清除无效 token
      localStorage.removeItem('token')
      // 重定向到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

### CSRF 防护

```typescript
// 从 meta 标签获取 CSRF token
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken || ''
  },
  body: JSON.stringify(data)
})
```

## 服务端安全（Node/TS）

### 参数化查询

```typescript
// 错误：SQL 注入风险
const query = `SELECT * FROM users WHERE id = '${userId}'`

// 正确：参数化查询
const query = 'SELECT * FROM users WHERE id = $1'
const result = await db.query(query, [userId])
```

### 错误处理

```typescript
// 错误：暴露敏感信息
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // 危险！
  })
})

// 正确：隐藏敏感信息
app.use((err, req, res, next) => {
  res.status(500).json({
    error: '服务器内部错误',
    requestId: req.id
  })
  // 仅服务端记录详细错误
  console.error(err)
})
```

## 安全检查清单

- [ ] 无硬编码密钥
- [ ] 使用环境变量存储敏感信息
- [ ] 用户输入验证（Zod）
- [ ] 避免 v-html 或使用 DOMPurify
- [ ] API 请求带认证 token
- [ ] 处理 401/403 响应
- [ ] CSRF 保护
- [ ] 参数化数据库查询
- [ ] 错误响应不暴露敏感信息

## 代理支持

- 使用 **security-reviewer** 技能进行全面安全审计