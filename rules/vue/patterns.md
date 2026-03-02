---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.vue"
---
# TypeScript/Vue 设计模式

> 此文件扩展 [common/patterns.md](../common/patterns.md) 添加 TypeScript/Vue 特定内容。

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## 组合式函数（Composables）

```typescript
// composables/useUser.ts
import { ref, computed } from 'vue'

export function useUser() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchUser(id: string) {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/users/${id}`)
      user.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  const isLoggedIn = computed(() => !!user.value)

  return {
    user,
    loading,
    error,
    fetchUser,
    isLoggedIn
  }
}

// 使用
const { user, loading, fetchUser } = useUser()
```

## 防抖 Hook

```typescript
import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>

  watch(value, (newValue) => {
    const handler = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)

    return () => clearTimeout(handler)
  })

  return debouncedValue
}

// 使用
const searchQuery = ref('')
const debouncedQuery = useDebounce(searchQuery, 500)
```

## Repository 模式

```typescript
interface Repository<T> {
  findAll(filters?: Filters): Promise<T[]>
  findById(id: string): Promise<T | null>
  create(data: CreateDto): Promise<T>
  update(id: string, data: UpdateDto): Promise<T>
  delete(id: string): Promise<void>
}
```

## Vue 状态管理

```typescript
// stores/useUserStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name ?? '游客')

  // 操作
  async function login(credentials: LoginCredentials) {
    loading.value = true
    try {
      user.value = await authApi.login(credentials)
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  return {
    user,
    loading,
    isLoggedIn,
    userName,
    login,
    logout
  }
})
```

## 参考

详见技能：`frontend-patterns` 获取完整的 React/Vue 模式。
