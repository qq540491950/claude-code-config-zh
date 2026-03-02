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

## XSS 防护

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

## 输入验证

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

## API 请求安全

```typescript
// 使用 axios 拦截器添加认证
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 处理 401 响应
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 重定向到登录页
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## CSRF 防护

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

## 安全检查清单

- [ ] 无硬编码密钥
- [ ] 使用环境变量存储敏感信息
- [ ] 用户输入验证（Zod）
- [ ] 避免 v-html 或使用 DOMPurify
- [ ] API 请求带认证 token
- [ ] 处理 401/403 响应
- [ ] CSRF 保护

## 代理支持

- 使用 **security-reviewer** 技能进行全面安全审计
