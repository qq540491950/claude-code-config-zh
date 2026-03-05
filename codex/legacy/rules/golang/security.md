---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 安全规范

> 此文件扩展 [common/security.md](../common/security.md) 添加 Go 特定内容。

## 密钥管理

```go
apiKey := os.Getenv("OPENAI_API_KEY")
if apiKey == "" {
    log.Fatal("OPENAI_API_KEY 未配置")
}
```

## 安全扫描

- 使用 **gosec** 进行静态安全分析：
  ```bash
  gosec ./...
  ```

## Context 与超时

始终使用 `context.Context` 进行超时控制：

```go
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

result, err := client.DoRequest(ctx, req)
```

## SQL 注入防护

```go
// 错误：字符串拼接
query := "SELECT * FROM users WHERE id = " + userID

// 正确：参数化查询
query := "SELECT * FROM users WHERE id = $1"
row := db.QueryRowContext(ctx, query, userID)
```

## 输入验证

```go
import "github.com/go-playground/validator/v10"

type UserRequest struct {
    Email string `validate:"required,email"`
    Age   int    `validate:"gte=0,lte=150"`
}

validate := validator.New()
if err := validate.Struct(req); err != nil {
    return err
}
```

## 安全检查清单

- [ ] 无硬编码密钥
- [ ] SQL 查询参数化
- [ ] 文件路径使用 filepath.Clean
- [ ] 敏感数据加密存储
- [ ] HTTPS 强制使用
- [ ] Context 超时设置
