# Go 微服务 — 项目 CLAUDE.md

> Go 微服务示例（PostgreSQL、gRPC、Docker）。
> 复制到项目根目录并根据你的服务自定义。

## 项目概述

**技术栈:** Go 1.22+, PostgreSQL, gRPC + REST (grpc-gateway), Docker, sqlc (类型安全 SQL), Wire (依赖注入)

**架构:** 整洁架构，包含 domain、repository、service 和 handler 层。gRPC 作为主要传输方式，REST gateway 用于外部客户端。

## 关键规则

### Go 约定

- 遵循 Effective Go 和 Go Code Review Comments 指南
- 使用 `errors.New` / `fmt.Errorf` 配合 `%w` 包装错误 — 永不使用字符串匹配错误
- 不使用 `init()` 函数 — 在 `main()` 或构造函数中显式初始化
- 不使用全局可变状态 — 通过构造函数传递依赖
- Context 必须是第一个参数并在所有层传播

### 数据库

- 所有查询放在 `queries/` 作为纯 SQL — sqlc 生成类型安全的 Go 代码
- 迁移放在 `migrations/` 使用 golang-migrate — 永不直接修改数据库
- 多步操作使用事务 via `pgx.Tx`
- 所有查询必须使用参数化占位符（`$1`, `$2`）— 永不使用字符串格式化

### 错误处理

- 返回错误，不 panic — panic 仅用于真正不可恢复的情况
- 用上下文包装错误：`fmt.Errorf("创建用户: %w", err)`
- 在 `domain/errors.go` 中定义业务逻辑的哨兵错误
- 在 handler 层将域错误映射到 gRPC 状态码

```go
// Domain 层 — 哨兵错误
var (
    ErrUserNotFound  = errors.New("用户不存在")
    ErrEmailTaken    = errors.New("邮箱已被注册")
)

// Handler 层 — 映射到 gRPC 状态
func toGRPCError(err error) error {
    switch {
    case errors.Is(err, domain.ErrUserNotFound):
        return status.Error(codes.NotFound, err.Error())
    case errors.Is(err, domain.ErrEmailTaken):
        return status.Error(codes.AlreadyExists, err.Error())
    default:
        return status.Error(codes.Internal, "内部错误")
    }
}
```

### 代码风格

- 代码或注释中不使用表情符号
- 导出的类型和函数必须有文档注释
- 保持函数在 50 行以内 — 提取辅助函数
- 对所有多情况逻辑使用表驱动测试
- 信号通道使用 `struct{}`，不使用 `bool`

## 文件结构

```
cmd/
  server/
    main.go              # 入口点，Wire 注入，优雅关闭
internal/
  domain/                # 业务类型和接口
    user.go              # User 实体和 repository 接口
    errors.go            # 哨兵错误
  service/               # 业务逻辑
    user_service.go
    user_service_test.go
  repository/            # 数据访问（sqlc 生成 + 自定义）
    postgres/
      user_repo.go
      user_repo_test.go  # 使用 testcontainers 的集成测试
  handler/               # gRPC + REST handlers
    grpc/
      user_handler.go
    rest/
      user_handler.go
  config/                # 配置加载
    config.go
proto/                   # Protobuf 定义
  user/v1/
    user.proto
queries/                 # sqlc 的 SQL 查询
  user.sql
migrations/              # 数据库迁移
  001_create_users.up.sql
  001_create_users.down.sql
```

## 关键模式

### Repository 接口

```go
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    FindByID(ctx context.Context, id uuid.UUID) (*User, error)
    FindByEmail(ctx context.Context, email string) (*User, error)
    Update(ctx context.Context, user *User) error
    Delete(ctx context.Context, id uuid.UUID) error
}
```

### 服务与依赖注入

```go
type UserService struct {
    repo   domain.UserRepository
    hasher PasswordHasher
    logger *slog.Logger
}

func NewUserService(repo domain.UserRepository, hasher PasswordHasher, logger *slog.Logger) *UserService {
    return &UserService{repo: repo, hasher: hasher, logger: logger}
}

func (s *UserService) Create(ctx context.Context, req CreateUserRequest) (*domain.User, error) {
    existing, err := s.repo.FindByEmail(ctx, req.Email)
    if err != nil && !errors.Is(err, domain.ErrUserNotFound) {
        return nil, fmt.Errorf("检查邮箱: %w", err)
    }
    if existing != nil {
        return nil, domain.ErrEmailTaken
    }

    hashed, err := s.hasher.Hash(req.Password)
    if err != nil {
        return nil, fmt.Errorf("哈希密码: %w", err)
    }

    user := &domain.User{
        ID:       uuid.New(),
        Name:     req.Name,
        Email:    req.Email,
        Password: hashed,
    }
    if err := s.repo.Create(ctx, user); err != nil {
        return nil, fmt.Errorf("创建用户: %w", err)
    }
    return user, nil
}
```

### 表驱动测试

```go
func TestUserService_Create(t *testing.T) {
    tests := []struct {
        name    string
        req     CreateUserRequest
        setup   func(*MockUserRepo)
        wantErr error
    }{
        {
            name: "有效用户",
            req:  CreateUserRequest{Name: "Alice", Email: "alice@example.com", Password: "secure123"},
            setup: func(m *MockUserRepo) {
                m.On("FindByEmail", mock.Anything, "alice@example.com").Return(nil, domain.ErrUserNotFound)
                m.On("Create", mock.Anything, mock.Anything).Return(nil)
            },
            wantErr: nil,
        },
        {
            name: "重复邮箱",
            req:  CreateUserRequest{Name: "Alice", Email: "taken@example.com", Password: "secure123"},
            setup: func(m *MockUserRepo) {
                m.On("FindByEmail", mock.Anything, "taken@example.com").Return(&domain.User{}, nil)
            },
            wantErr: domain.ErrEmailTaken,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            repo := new(MockUserRepo)
            tt.setup(repo)
            svc := NewUserService(repo, &bcryptHasher{}, slog.Default())

            _, err := svc.Create(context.Background(), tt.req)

            if tt.wantErr != nil {
                assert.ErrorIs(t, err, tt.wantErr)
            } else {
                assert.NoError(t, err)
            }
        })
    }
}
```

## 环境变量

```bash
# 数据库
DATABASE_URL=postgres://user:pass@localhost:5432/myservice?sslmode=disable

# gRPC
GRPC_PORT=50051
REST_PORT=8080

# 认证
JWT_SECRET=           # 生产环境从 vault 加载
TOKEN_EXPIRY=24h

# 可观测性
LOG_LEVEL=info        # debug, info, warn, error
OTEL_ENDPOINT=        # OpenTelemetry collector
```

## 测试策略

```bash
/go-test             # Go TDD 工作流
/go-review           # Go 特定代码审查
/go-build            # 修复构建错误
```

### 测试命令

```bash
# 单元测试（快速，无外部依赖）
go test ./internal/... -short -count=1

# 集成测试（需要 Docker 运行 testcontainers）
go test ./internal/repository/... -count=1 -timeout 120s

# 所有测试及覆盖率
go test ./... -coverprofile=coverage.out -count=1
go tool cover -func=coverage.out  # 摘要
go tool cover -html=coverage.out  # 浏览器

# 竞态检测
go test ./... -race -count=1
```

## 工作流

```bash
# 规划
/plan "为用户端点添加限流"

# 开发
/go-test                  # 使用 Go 特定模式的 TDD

# 审查
/go-review                # Go 惯用法、错误处理、并发
/security-scan            # 密钥和漏洞

# 合并前
go vet ./...
staticcheck ./...
```

## Git 工作流

- `feat:` 新功能，`fix:` Bug 修复，`refactor:` 代码重构
- 从 `main` 创建功能分支，需要 PR
- CI: `go vet`、`staticcheck`、`go test -race`、`golangci-lint`
- 部署: CI 中构建 Docker 镜像，部署到 Kubernetes
