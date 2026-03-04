---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.vue"
---
# TypeScript/Vue 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 TypeScript/Vue 特定内容。

## 类型安全

- 公共函数必须显式声明参数与返回类型
- 优先使用 `unknown`，避免 `any`
- 使用类型收窄（type guard）处理联合类型
- 禁止 `@ts-ignore`、`@ts-expect-error` 作为常规修复手段

```typescript
// 类型守卫
function isErrorLike(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value
}

// 判别联合
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
```

## 不可变性

优先使用不可变更新：

```typescript
// 错误：原地修改
state.items.push(item)

// 正确：返回新对象
const nextState = {
  ...state,
  items: [...state.items, item],
}

// 数组更新
const next = prev.map((item) =>
  item.id === targetId ? { ...item, enabled: true } : item,
)
```

## Vue 响应式

```typescript
import { ref, computed } from 'vue'

const user = ref({ name: 'Alice', age: 25 })

// 错误：直接修改
// user.value.age = 26

// 正确：创建新对象
user.value = { ...user.value, age: 26 }
```

## 错误处理

```typescript
try {
  const result = await service.run()
  return result
} catch (error) {
  throw new Error(`执行失败: ${String(error)}`)
}

// 早返回降低嵌套
function handle(input?: string): string {
  if (!input) return 'empty'
  if (input.length < 3) return 'short'
  return 'ok'
}
```

## Vue 组件规范

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Props 定义
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits 定义
const emit = defineEmits<{
  update: [value: number]
}>()

// 响应式状态
const localCount = ref(props.count)

// 计算属性
const doubled = computed(() => localCount.value * 2)

// 方法
function increment() {
  localCount.value++
  emit('update', localCount.value)
}

// 生命周期
onMounted(() => {
  console.log('组件已挂载')
})
</script>

<template>
  <div class="component">
    <h2>{{ title }}</h2>
    <p>计数: {{ localCount }}</p>
    <button @click="increment">增加</button>
  </div>
</template>

<style scoped>
.component {
  padding: 1rem;
}
</style>
```

## 导入与模块

- 按"标准库 / 第三方 / 本地模块"分组导入
- 删除未使用导入
- 避免循环依赖

## 输入验证

使用 Zod 进行基于模式的验证：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## 日志规范

- 生产代码中不应保留 `console.log`
- 使用项目约定日志方式替代

## 参考

详见技能：`frontend-patterns` 获取 TypeScript/Vue 前端模式示例。
