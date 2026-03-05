---
name: golang-testing
description: Go 测试最佳实践，涵盖表驱动测试、Mock 策略、基准测试、覆盖率分析。
---

# Go 测试模式

适用于 Go 项目的测试策略，使用标准库 testing 包和常用测试工具。

## 何时激活

- 编写 Go 单元测试
- Mock 接口依赖
- 编写基准测试
- 提高测试覆盖率

## 1. 基础测试

### 测试文件结构

```
myapp/
├── calculator.go
├── calculator_test.go    # 同包测试
└── internal/
    └── helper/
        ├── helper.go
        └── helper_test.go
```

### 基础测试函数

```go
// calculator.go
package myapp

func Add(a, b int) int {
    return a + b
}

func Divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("除数不能为零")
    }
    return a / b, nil
}

// calculator_test.go
package myapp

import (
    "testing"
)

func TestAdd(t *testing.T) {
    got := Add(2, 3)
    want := 5
    if got != want {
        t.Errorf("Add(2, 3) = %d; want %d", got, want)
    }
}

func TestDivide(t *testing.T) {
    t.Run("正常除法", func(t *testing.T) {
        got, err := Divide(10, 2)
        if err != nil {
            t.Fatalf("unexpected error: %v", err)
        }
        if got != 5.0 {
            t.Errorf("Divide(10, 2) = %f; want 5.0", got)
        }
    })

    t.Run("除零错误", func(t *testing.T) {
        _, err := Divide(10, 0)
        if err == nil {
            t.Error("expected error for division by zero")
        }
    })
}
```

## 2. 表驱动测试

### 基础表驱动

```go
func TestAddTableDriven(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 2, 3, 5},
        {"negative numbers", -1, -1, -2},
        {"zero", 0, 0, 0},
        {"mixed", -5, 10, 5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got := Add(tt.a, tt.b)
            if got != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d",
                    tt.a, tt.b, got, tt.expected)
            }
        })
    }
}
```

### 复杂表驱动

```go
func TestParseConfig(t *testing.T) {
    tests := []struct {
        name        string
        input       string
        want        *Config
        wantErr     bool
        errContains string
    }{
        {
            name:  "valid config",
            input: `{"port": 8080, "host": "localhost"}`,
            want:  &Config{Port: 8080, Host: "localhost"},
        },
        {
            name:        "invalid json",
            input:       `{invalid}`,
            wantErr:     true,
            errContains: "invalid character",
        },
        {
            name:    "empty input",
            input:   "",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := ParseConfig(tt.input)

            if tt.wantErr {
                if err == nil {
                    t.Fatal("expected error, got nil")
                }
                if tt.errContains != "" && !strings.Contains(err.Error(), tt.errContains) {
                    t.Errorf("error = %v; want containing %q", err, tt.errContains)
                }
                return
            }

            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if !reflect.DeepEqual(got, tt.want) {
                t.Errorf("ParseConfig() = %v; want %v", got, tt.want)
            }
        })
    }
}
```

## 3. Mock 策略

### 接口 Mock

```go
// repository.go
type UserRepository interface {
    FindByID(id string) (*User, error)
    Create(user *User) error
}

// service.go
type UserService struct {
    repo UserRepository
}

func (s *UserService) GetUser(id string) (*User, error) {
    return s.repo.FindByID(id)
}

// service_test.go
type mockUserRepository struct {
    users map[string]*User
}

func (m *mockUserRepository) FindByID(id string) (*User, error) {
    if user, ok := m.users[id]; ok {
        return user, nil
    }
    return nil, errors.New("user not found")
}

func (m *mockUserRepository) Create(user *User) error {
    m.users[user.ID] = user
    return nil
}

func TestUserService_GetUser(t *testing.T) {
    mockRepo := &mockUserRepository{
        users: map[string]*User{
            "1": {ID: "1", Name: "Alice"},
        },
    }

    service := &UserService{repo: mockRepo}

    user, err := service.GetUser("1")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if user.Name != "Alice" {
        t.Errorf("got name %q; want %q", user.Name, "Alice")
    }
}
```

### 使用 testify/mock

```go
import (
    "testing"
    "github.com/stretchr/testify/mock"
    "github.com/stretchr/testify/assert"
)

type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) FindByID(id string) (*User, error) {
    args := m.Called(id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

func TestUserService_GetUser_Mock(t *testing.T) {
    mockRepo := new(MockUserRepository)
    service := &UserService{repo: mockRepo}

    // 设置期望
    mockRepo.On("FindByID", "1").Return(&User{ID: "1", Name: "Alice"}, nil)
    mockRepo.On("FindByID", "999").Return(nil, errors.New("not found"))

    // 测试正常情况
    user, err := service.GetUser("1")
    assert.NoError(t, err)
    assert.Equal(t, "Alice", user.Name)

    // 测试错误情况
    _, err = service.GetUser("999")
    assert.Error(t, err)

    // 验证所有期望都被调用
    mockRepo.AssertExpectations(t)
}
```

## 4. 测试辅助函数

### 设置和清理

```go
func TestWithSetup(t *testing.T) {
    // Setup
    db, err := setupTestDB()
    if err != nil {
        t.Fatalf("setup failed: %v", err)
    }
    defer db.Close() // Cleanup

    // 测试代码
    err = db.Insert(&User{Name: "test"})
    if err != nil {
        t.Errorf("insert failed: %v", err)
    }
}

// 使用 t.Cleanup
func TestWithCleanup(t *testing.T) {
    db := setupDB()
    t.Cleanup(func() {
        db.Close()
    })

    // 测试代码
}
```

### 测试 fixtures

```go
func newTestUser() *User {
    return &User{
        ID:    "test-id",
        Name:  "Test User",
        Email: "test@example.com",
    }
}

func TestUserValidation(t *testing.T) {
    tests := []struct {
        name    string
        modify  func(*User)
        wantErr bool
    }{
        {
            name:    "valid user",
            modify:  func(u *User) {},
            wantErr: false,
        },
        {
            name: "empty name",
            modify: func(u *User) {
                u.Name = ""
            },
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            user := newTestUser()
            tt.modify(user)

            err := user.Validate()
            if (err != nil) != tt.wantErr {
                t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

## 5. 基准测试

### 基础基准测试

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}

func BenchmarkAddParallel(b *testing.B) {
    b.RunParallel(func(pb *testing.PB) {
        for pb.Next() {
            Add(1, 2)
        }
    })
}
```

### 运行基准测试

```bash
# 运行所有基准测试
go test -bench=.

# 运行特定基准测试
go test -bench=BenchmarkAdd

# 包含内存分析
go test -bench=. -benchmem

# 多次运行取平均
go test -bench=. -count=5
```

## 6. 测试覆盖率

```bash
# 查看覆盖率
go test -cover

# 生成覆盖率报告
go test -coverprofile=coverage.out

# 查看详细覆盖率
go tool cover -func=coverage.out

# 生成 HTML 报告
go tool cover -html=coverage.out
```

## 7. 常用命令

```bash
# 运行所有测试
go test ./...

# 运行特定包
go test ./mypackage

# 运行特定测试
go test -run TestAdd

# 运行匹配正则的测试
go test -run "TestAdd|TestSubtract"

# 详细输出
go test -v

# 检测竞态条件
go test -race

# 设置超时
go test -timeout 30s
```

## 检查清单

- [ ] 测试文件以 `_test.go` 结尾
- [ ] 使用表驱动测试减少重复
- [ ] Mock 外部依赖
- [ ] 测试错误路径
- [ ] 使用 t.Run 组织子测试
- [ ] 覆盖率 ≥ 80%

## 参考

- `rules/golang/testing.md` - Go 测试规则
- `golang-patterns` - Go 设计模式
