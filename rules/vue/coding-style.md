---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.vue"
---
# TypeScript/Vue 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 TypeScript/Vue 特定内容。

## 不可变性

使用展开运算符进行不可变更新：

```typescript
// 错误：直接修改
function updateUser(user, name) {
  user.name = name  // 修改！
  return user
}

// 正确：不可变
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}

// Vue 响应式
import { ref, computed } from 'vue'

const user = ref({ name: 'Alice', age: 25 })

// 错误：直接修改
// user.value.age = 26

// 正确：创建新对象
user.value = { ...user.value, age: 26 }
```

## 错误处理

使用 async/await 配合 try-catch：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('操作失败:', error)
  throw new Error('详细的用户友好消息')
}
```

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

## Console.log

- 生产代码中不应有 `console.log`
- 使用适当的日志库替代
- 参考 hooks 自动检测

## 参考

详见技能：`frontend-patterns` 获取全面的 React/Vue 模式。
