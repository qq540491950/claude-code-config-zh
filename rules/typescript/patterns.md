---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript 常用模式

## 类型守卫（Type Guard）

```typescript
function isErrorLike(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value
}
```

## 判别联合（Discriminated Union）

```typescript
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }
```

## 不可变更新

```typescript
const next = prev.map((item) =>
  item.id === targetId ? { ...item, enabled: true } : item,
)
```

## 早返回降低嵌套

```typescript
function handle(input?: string): string {
  if (!input) return 'empty'
  if (input.length < 3) return 'short'
  return 'ok'
}
```

## 参考

详见技能：`frontend-patterns` 获取更完整的前端模式。
