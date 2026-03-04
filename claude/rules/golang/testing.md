---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 Go 特定内容。

## 框架

使用标准 `go test` 配合**表驱动测试**。

## 竞态检测

始终使用 `-race` 标志运行：

```bash
go test -race ./...
```

## 覆盖率

```bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## 表驱动测试示例

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"正数", 2, 3, 5},
        {"负数", -1, -1, -2},
        {"零", 0, 0, 0},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", 
                    tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

## 参考

详见技能：`golang-testing` 获取详细的 Go 测试模式和辅助工具。
