---
name: ucc-go-test
description: 执行 Go TDD 工作流。先写表驱动测试，再实现。用 go test -cover 验证 80%+ 覆盖率。
---

# ucc-go-test

This skill is migrated from legacy command `ucc-go-test` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-go-test`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Go TDD 命令

此命令使用惯用的 Go 测试模式执行测试驱动开发方法论。

## 命令功能

1. **定义类型/接口**：先搭建函数签名
2. **编写表驱动测试**：创建全面的测试用例（RED）
3. **运行测试**：验证测试因正确原因失败
4. **实现代码**：编写最小代码使其通过（GREEN）
5. **重构**：改进代码，保持测试绿色
6. **检查覆盖率**：确保 80%+ 覆盖率

## 使用时机

在以下情况使用 `$ucc-go-test`：
- 实现新的 Go 函数
- 为现有代码添加测试覆盖
- 修复 Bug（先写失败的测试）
- 构建关键业务逻辑
- 学习 Go 中的 TDD 工作流

## TDD 循环

```
RED     → 编写失败的表驱动测试
GREEN   → 实现最小代码使其通过
REFACTOR → 改进代码，测试保持绿色
REPEAT  → 下一个测试用例
```

## 示例会话

```
用户: $ucc-go-test 我需要一个验证邮箱地址的函数

代理:
# TDD 会话: 邮箱验证器

## 步骤 1: 定义接口

```go
// validator/email.go
package validator

// ValidateEmail 检查给定字符串是否为有效邮箱地址。
// 如果有效返回 nil，否则返回描述问题的错误。
func ValidateEmail(email string) error {
    panic("not implemented")
}
```

## 步骤 2: 编写表驱动测试（RED）

```go
// validator/email_test.go
package validator

import "testing"

func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        // 有效邮箱
        {"简单邮箱", "user@example.com", false},
        {"带子域名", "user@mail.example.com", false},
        {"带加号", "user+tag@example.com", false},
        {"带点", "first.last@example.com", false},

        // 无效邮箱
        {"空字符串", "", true},
        {"无@符号", "userexample.com", true},
        {"无域名", "user@", true},
        {"无本地部分", "@example.com", true},
        {"双@符号", "user@@example.com", true},
        {"含空格", "user @example.com", true},
        {"无顶级域名", "user@example", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if tt.wantErr && err == nil {
                t.Errorf("ValidateEmail(%q) = nil; 期望错误", tt.email)
            }
            if !tt.wantErr && err != nil {
                t.Errorf("ValidateEmail(%q) = %v; 期望 nil", tt.email, err)
            }
        })
    }
}
```

## 步骤 3: 运行测试 - 验证 FAIL

```bash
$ go test ./validator/...

--- FAIL: TestValidateEmail (0.00s)
    --- FAIL: TestValidateEmail/简单邮箱 (0.00s)
        panic: not implemented

FAIL
```

✓ 测试按预期失败（panic）。

## 步骤 4: 实现最小代码（GREEN）

```go
// validator/email.go
package validator

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

var (
    ErrEmailEmpty   = errors.New("邮箱不能为空")
    ErrEmailInvalid = errors.New("邮箱格式无效")
)

func ValidateEmail(email string) error {
    if email == "" {
        return ErrEmailEmpty
    }
    if !emailRegex.MatchString(email) {
        return ErrEmailInvalid
    }
    return nil
}
```

## 步骤 5: 运行测试 - 验证 PASS

```bash
$ go test ./validator/...

PASS
ok      project/validator    0.003s
```

✓ 所有测试通过！

## 步骤 6: 检查覆盖率

```bash
$ go test -cover ./validator/...

PASS
coverage: 100.0% of statements
ok      project/validator    0.003s
```

✓ 覆盖率: 100%

## TDD 完成！
```

## 测试模式

### 表驱动测试
```go
tests := []struct {
    name     string
    input    InputType
    want     OutputType
    wantErr  bool
}{
    {"用例 1", input1, want1, false},
    {"用例 2", input2, want2, true},
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        got, err := Function(tt.input)
        // 断言
    })
}
```

### 并行测试
```go
for _, tt := range tests {
    tt := tt // 捕获
    t.Run(tt.name, func(t *testing.T) {
        t.Parallel()
        // 测试体
    })
}
```

### 测试辅助函数
```go
func setupTestDB(t *testing.T) *sql.DB {
    t.Helper()
    db := createDB()
    t.Cleanup(func() { db.Close() })
    return db
}
```

## 覆盖率命令

```bash
# 基本覆盖率
go test -cover ./...

# 覆盖率配置文件
go test -coverprofile=coverage.out ./...

# 在浏览器中查看
go tool cover -html=coverage.out

# 按函数覆盖率
go tool cover -func=coverage.out

# 带竞态检测
go test -race -cover ./...
```

## 覆盖率目标

| 代码类型 | 目标 |
|-----------|--------|
| 关键业务逻辑 | 100% |
| 公共 API | 90%+ |
| 一般代码 | 80%+ |
| 生成代码 | 排除 |

## TDD 最佳实践

**要做：**
- 首先编写测试，在任何实现之前
- 每次更改后运行测试
- 使用表驱动测试获得全面覆盖
- 测试行为，而非实现细节
- 包含边界情况（空、nil、最大值）

**不要：**
- 在测试之前编写实现
- 跳过 RED 阶段
- 直接测试私有函数
- 在测试中使用 `time.Sleep`
- 忽略不稳定的测试

## 相关命令

- `$ucc-go-build` - 修复构建错误
- `$ucc-go-review` - 实现后审查代码
- `$ucc-verify` - 运行完整验证循环

## 相关

- Skill: `skills/golang-testing/`
- Skill: `skills/tdd-workflow/`
