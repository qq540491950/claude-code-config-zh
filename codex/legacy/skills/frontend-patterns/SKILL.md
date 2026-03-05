---
name: frontend-patterns
description: 前端开发模式，包括 React、Vue、状态管理、性能优化和 UI 最佳实践。
---

# 前端开发模式

现代前端模式，用于 React、Vue 和高性能用户界面。

## 何时激活

- 构建 React/Vue 组件（组合、Props、渲染）
- 管理状态（useState、useReducer、Pinia、Context）
- 实现数据获取（SWR、React Query、服务端组件）
- 优化性能（记忆化、虚拟化、代码分割）
- 处理表单（验证、受控输入、Zod 模式）

## 组件模式

### 组合优于继承

```typescript
// ✅ 好：组件组合
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

// 使用
<Card>
  <CardHeader>标题</CardHeader>
  <CardBody>内容</CardBody>
</Card>
```

### Vue 组合式函数

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
```

## 自定义 Hooks 模式

### 状态管理 Hook

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// 使用
const [isOpen, toggleOpen] = useToggle()
```

### 防抖 Hook

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 使用
const [searchQuery, setSearchQuery] = useState('')
const debouncedQuery = useDebounce(searchQuery, 500)

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery)
  }
}, [debouncedQuery])
```

## 状态管理模式

### Context + Reducer 模式

```typescript
interface State {
  markets: Market[]
  selectedMarket: Market | null
  loading: boolean
}

type Action =
  | { type: 'SET_MARKETS'; payload: Market[] }
  | { type: 'SELECT_MARKET'; payload: Market }
  | { type: 'SET_LOADING'; payload: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MARKETS':
      return { ...state, markets: action.payload }
    case 'SELECT_MARKET':
      return { ...state, selectedMarket: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}
```

### Pinia 状态管理

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

## 性能优化

### 记忆化

```typescript
// ✅ useMemo 用于昂贵计算
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ useCallback 用于传递给子组件的函数
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// ✅ React.memo 用于纯组件
export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return (
    <div className="market-card">
      <h3>{market.name}</h3>
    </div>
  )
})
```

### 代码分割与懒加载

```typescript
import { lazy, Suspense } from 'react'

// ✅ 懒加载重型组件
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  )
}
```

### 虚拟化长列表

```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <ItemCard item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 表单处理模式

### 带验证的受控表单

```typescript
interface FormData {
  name: string
  email: string
}

interface FormErrors {
  name?: string
  email?: string
}

export function CreateForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = '名称必填'
    }

    if (!formData.email.trim()) {
      newErrors.email = '邮箱必填'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式无效'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await createItem(formData)
    } catch (error) {
      // 错误处理
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="名称"
      />
      {errors.name && <span className="error">{errors.name}</span>}

      <input
        value={formData.email}
        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
        placeholder="邮箱"
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <button type="submit">提交</button>
    </form>
  )
}
```

### Zod 验证

```typescript
import { z } from 'zod'

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

## 错误边界模式

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>出错了</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 使用
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## 无障碍模式

### 键盘导航

```typescript
export function Dropdown({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        onSelect(options[activeIndex])
        setIsOpen(false)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      onKeyDown={handleKeyDown}
    >
      {/* 实现细节 */}
    </div>
  )
}
```

**记住**：现代前端模式支持可维护、高性能的用户界面。选择适合项目复杂度的模式。
