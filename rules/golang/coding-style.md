---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 Go 特定内容。

## 格式化

- **gofmt** 和 **goimports** 是强制性的 — 无风格争议

## 设计原则

- 接受接口，返回结构体
- 保持接口小（1-3个方法）

## 错误处理

始终用上下文包装错误：

```go
if err != nil {
    return fmt.Errorf("创建用户失败: %w", err)
}
```

## 参考

详见技能：`golang-patterns` 获取全面的 Go 惯用法和模式。
