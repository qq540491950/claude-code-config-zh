---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 JavaScript/Node 特定内容。

## 可读性

- 函数保持短小，避免超过 50 行
- 优先提前返回，减少深层嵌套
- 变量命名语义化，避免 `tmp/data/x` 等弱语义命名

## 模块与导入

- 导入按“内置模块 / 第三方 / 本地模块”分组
- 删除未使用导入
- 新文件默认使用项目现有模块系统（ESM/CJS）

## 不可变性

优先返回新对象，避免原地修改：

```javascript
// 错误
state.list.push(item)

// 正确
const nextState = {
  ...state,
  list: [...state.list, item],
}
```

## 调试语句

- 生产代码不得保留 `console.log`
- 使用项目约定日志接口并区分日志级别
