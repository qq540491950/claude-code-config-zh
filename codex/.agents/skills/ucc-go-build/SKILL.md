---
name: ucc-go-build
description: 增量修复 Go 构建错误、go vet 警告和 linter 问题。调用 go-build-resolver 代理进行最小、精准的修复。
---

# ucc-go-build

This skill is migrated from legacy command `ucc-go-build` and is now executed via Codex Skills.

## Trigger

- Explicit call: `$ucc-go-build`
- Or natural-language request that matches this workflow

## Input

- User request and current repository context
- Parse parameters based on the usage section below

## Output

- Return actionable result, review, or plan
- If UCC semantic is active, append: `?????UCC`

## Workflow

# Go 构建和修复

此命令调用 **go-build-resolver** 代理以最小更改增量修复 Go 构建错误。

## 命令功能

1. **运行诊断**：执行 `go build`、`go vet`、`staticcheck`
2. **解析错误**：按文件分组并按严重程度排序
3. **增量修复**：一次修复一个错误
4. **验证每个修复**：每次更改后重新构建
5. **报告摘要**：显示已修复和剩余的问题

## 使用时机

在以下情况使用 `$ucc-go-build`：
- `go build ./...` 因错误失败
- `go vet ./...` 报告问题
- `golangci-lint run` 显示警告
- 模块依赖损坏
- 拉取更改后构建失败

## 运行的诊断命令

```bash
# 主要构建检查
go build ./...

# 静态分析
go vet ./...

# 扩展 lint（如果可用）
staticcheck ./...
golangci-lint run

# 模块问题
go mod verify
go mod tidy -v
```

## 示例会话

```text
用户: $ucc-go-build

代理:
# Go 构建解决

## 初始诊断

```bash
$ go build ./...
internal/service/user.go:25:15: undefined: UserRepository
internal/handler/api.go:42:9: cannot use x (type string) as type int
internal/handler/api.go:58:2: missing return at end of function
```

发现错误: 3

## 修复 1: 未定义标识符

文件: internal/service/user.go:25
错误: undefined: UserRepository
原因: 缺少导入

```go
// 添加导入
import "project/internal/repository"

// 更改
var repo UserRepository
// 改为
var repo repository.UserRepository
```

```bash
$ go build ./...
# 剩余 2 个错误
```

## 修复 2: 类型不匹配

文件: internal/handler/api.go:42
错误: cannot use x (type string) as type int

```go
// 更改
count := params.Get("count")
// 改为
countStr := params.Get("count")
count, _ := strconv.Atoi(countStr)
```

```bash
$ go build ./...
# 剩余 1 个错误
```

## 修复 3: 缺少返回

文件: internal/handler/api.go:58
错误: missing return at end of function

```go
func GetUser(id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    user := findUser(id)
    // 添加缺少的返回
    return user, nil
}
```

```bash
$ go build ./...
# 构建成功！
```

## 最终验证

```bash
$ go vet ./...
# 无问题

$ go test ./...
ok      project/internal/service   0.015s
ok      project/internal/handler   0.023s
```

## 摘要

| 指标 | 数量 |
|--------|-------|
| 构建错误已修复 | 3 |
| Vet 警告已修复 | 0 |
| 文件已修改 | 2 |
| 剩余问题 | 0 |

构建状态: ✅ 成功
```

## 常见错误修复

| 错误 | 典型修复 |
|-------|-------------|
| `undefined: X` | 添加导入或修复拼写 |
| `cannot use X as Y` | 类型转换或修复赋值 |
| `missing return` | 添加返回语句 |
| `X does not implement Y` | 添加缺少的方法 |
| `import cycle` | 重构包结构 |
| `declared but not used` | 移除或使用变量 |
| `cannot find package` | `go get` 或 `go mod tidy` |

## 修复策略

1. **先修复构建错误** - 代码必须能编译
2. **再修复 Vet 警告** - 修复可疑构造
3. **然后修复 Lint 警告** - 风格和最佳实践
4. **一次修复一个** - 验证每个更改
5. **最小更改** - 不要重构，只修复

## 停止条件

代理将在以下情况停止并报告：
- 3 次尝试后错误仍然存在
- 修复引入更多错误
- 需要架构更改
- 缺少外部依赖

## 相关命令

- `$ucc-go-test` - 构建成功后运行测试
- `$ucc-go-review` - 审查代码质量
- `$ucc-verify` - 完整验证循环

## 相关

- Agent: `agents/go-build-resolver.md`
- Skill: `skills/golang-patterns/`
