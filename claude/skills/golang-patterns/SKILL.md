---
name: golang-patterns
description: 惯用 Go 模式、最佳实践和约定，用于构建健壮、高效、可维护的 Go 应用程序。
---

# Go 开发模式

惯用 Go 模式和最佳实践，用于构建健壮、高效、可维护的应用程序。

## 何时激活

- 编写新的 Go 代码
- 审查 Go 代码
- 重构现有 Go 代码
- 设计 Go 包/模块

## 核心原则

### 1. 简洁和清晰

Go 偏好简洁而非聪明。代码应该显而易见且易于阅读。

```go
// 好：清晰直接
func GetUser(id string) (*User, error) {
    user, err := db.FindUser(id)
    if err != nil {
        return nil, fmt.Errorf("获取用户 %s: %w", id, err)
    }
    return user, nil
}
```

### 2. 让零值有用

设计类型使其零值无需初始化即可使用。

```go
// 好：零值有用
type Counter struct {
    mu    sync.Mutex
    count int // 零值是 0，可直接使用
}

func (c *Counter) Inc() {
    c.mu.Lock()
    c.count++
    c.mu.Unlock()
}
```

### 3. 接受接口，返回结构体

函数应接受接口参数，返回具体类型。

```go
// 好：接受接口，返回具体类型
func ProcessData(r io.Reader) (*Result, error) {
    data, err := io.ReadAll(r)
    if err != nil {
        return nil, err
    }
    return &Result{Data: data}, nil
}
```

## 错误处理模式

### 带上下文的错误包装

```go
func LoadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("加载配置 %s: %w", path, err)
    }

    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("解析配置 %s: %w", path, err)
    }

    return &cfg, nil
}
```

### 使用 errors.Is 和 errors.As 检查错误

```go
func HandleError(err error) {
    // 检查特定错误
    if errors.Is(err, sql.ErrNoRows) {
        log.Println("未找到记录")
        return
    }

    // 检查错误类型
    var validationErr *ValidationError
    if errors.As(err, &validationErr) {
        log.Printf("字段 %s 验证错误: %s",
            validationErr.Field, validationErr.Message)
        return
    }
}
```

## 并发模式

### Worker Pool

```go
func WorkerPool(jobs <-chan Job, results chan<- Result, numWorkers int) {
    var wg sync.WaitGroup

    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for job := range jobs {
                results <- process(job)
            }
        }()
    }

    wg.Wait()
    close(results)
}
```

### Context 超时控制

```go
func FetchWithTimeout(ctx context.Context, url string) ([]byte, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, fmt.Errorf("创建请求: %w", err)
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("获取 %s: %w", url, err)
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}
```

### 优雅关闭

```go
func GracefulShutdown(server *http.Server) {
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

    <-quit
    log.Println("关闭服务器...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("服务器强制关闭: %v", err)
    }

    log.Println("服务器已退出")
}
```

## 接口设计

### 小而专注的接口

```go
// 好：单方法接口
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// 按需组合接口
type ReadWriter interface {
    Reader
    Writer
}
```

### 在使用处定义接口

```go
// 在消费者包中，而非提供者包中
package service

// UserStore 定义此服务需要什么
type UserStore interface {
    GetUser(id string) (*User, error)
    SaveUser(user *User) error
}

type Service struct {
    store UserStore
}
```

## 结构体设计

### 函数式选项模式

```go
type Server struct {
    addr    string
    timeout time.Duration
    logger  *log.Logger
}

type Option func(*Server)

func WithTimeout(d time.Duration) Option {
    return func(s *Server) {
        s.timeout = d
    }
}

func WithLogger(l *log.Logger) Option {
    return func(s *Server) {
        s.logger = l
    }
}

func NewServer(addr string, opts ...Option) *Server {
    s := &Server{
        addr:    addr,
        timeout: 30 * time.Second, // 默认值
        logger:  log.Default(),    // 默认值
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// 使用
server := NewServer(":8080",
    WithTimeout(60*time.Second),
    WithLogger(customLogger),
)
```

## 性能优化

### 预分配切片

```go
// 坏：多次增长切片
func processItems(items []Item) []Result {
    var results []Result
    for _, item := range items {
        results = append(results, process(item))
    }
    return results
}

// 好：单次分配
func processItems(items []Item) []Result {
    results := make([]Result, 0, len(items))
    for _, item := range items {
        results = append(results, process(item))
    }
    return results
}
```

### 避免循环中字符串拼接

```go
// 坏：创建多个字符串分配
func join(parts []string) string {
    var result string
    for _, p := range parts {
        result += p + ","
    }
    return result
}

// 好：使用 strings.Builder 单次分配
func join(parts []string) string {
    var sb strings.Builder
    for i, p := range parts {
        if i > 0 {
            sb.WriteString(",")
        }
        sb.WriteString(p)
    }
    return sb.String()
}
```

## 常用命令

```bash
# 构建和运行
go build ./...
go run ./cmd/myapp

# 测试
go test ./...
go test -race ./...
go test -cover ./...

# 静态分析
go vet ./...
staticcheck ./...
golangci-lint run

# 模块管理
go mod tidy
go mod verify

# 格式化
gofmt -w .
goimports -w .
```

## Go 惯用法速查

| 惯用法 | 描述 |
|-------|------|
| 接受接口，返回结构体 | 函数接受接口参数，返回具体类型 |
| 错误是值 | 将错误视为一等值，而非异常 |
| 不要通过共享内存通信 | 使用 channel 协调 goroutine |
| 让零值有用 | 类型应无需显式初始化即可工作 |
| 少许复制优于少许依赖 | 避免不必要的外部依赖 |
| 清晰优于聪明 | 优先考虑可读性 |
| gofmt 不是任何人的最爱但它是所有人的朋友 | 始终用 gofmt/goimports 格式化 |
| 提前返回 | 先处理错误，保持顺利路径无缩进 |

**记住**：Go 代码应该是"无聊"的——可预测、一致、易于理解。如有疑问，保持简单。
