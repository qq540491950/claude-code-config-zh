---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.vue"
---
# TypeScript/Vue 设计模式

> 此文件扩展 [common/patterns.md](../common/patterns.md) 添加 TypeScript/Vue 特定内容。

## 类型模式

### 类型守卫

```typescript
function isErrorLike(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value
}

// 使用
if (isErrorLike(error)) {
  console.log(error.message)
}
```

### 判别联合

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

function handleResult<T>(result: Result<T>): T {
  if (result.ok) {
    return result.data
  }
  throw new Error(result.error)
}
```

### 条件类型

```typescript
type NonNullable<T> = T extends null | undefined ? never : T

type ApiResponse<T> = {
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

## Vue 组合式函数（Composables）

### 基础 Composable

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

### 防抖 Hook

```typescript
import { ref, watch, type Ref } from 'vue'

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

### 本地存储 Hook

```typescript
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const stored = localStorage.getItem(key)
  const data = ref(stored ? JSON.parse(stored) : defaultValue) as Ref<T>

  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return data
}
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

// 实现
class ApiRepository<T> implements Repository<T> {
  constructor(private baseUrl: string) {}

  async findAll(filters?: Filters): Promise<T[]> {
    const params = new URLSearchParams(filters as Record<string, string>)
    const response = await fetch(`${this.baseUrl}?${params}`)
    return response.json()
  }

  async findById(id: string): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}/${id}`)
    if (!response.ok) return null
    return response.json()
  }

  // ... 其他方法
}
```

## 状态管理（Pinia）

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

## 错误处理模式

### Result 类型

```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E }

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: 'Division by zero' }
  }
  return { success: true, value: a / b }
}

// 使用
const result = divide(10, 2)
if (result.success) {
  console.log(result.value)
} else {
  console.error(result.error)
}
```

## 参考

详见技能：`frontend-patterns` 获取完整的 React/Vue 模式。
