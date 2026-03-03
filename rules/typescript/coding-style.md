---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 TypeScript 特定内容。

## 类型安全

- 公共函数必须显式声明参数与返回类型
- 优先使用 `unknown`，避免 `any`
- 使用类型收窄（type guard）处理联合类型
- 禁止 `@ts-ignore`、`@ts-expect-error` 作为常规修复手段

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
```

## 错误处理

```typescript
try {
  const result = await service.run()
  return result
} catch (error) {
  throw new Error(`执行失败: ${String(error)}`)
}
```

## 导入与模块

- 按“标准库 / 第三方 / 本地模块”分组导入
- 删除未使用导入
- 避免循环依赖

## 日志规范

- 生产代码中不应保留 `console.log`
- 使用项目约定日志方式替代

## 参考

详见技能：`frontend-patterns` 获取 TypeScript 前端模式示例。
