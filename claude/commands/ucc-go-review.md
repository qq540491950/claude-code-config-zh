---
description: 全面的 Go 代码审查，检查惯用模式、并发安全、错误处理和安全问题。调用 go-reviewer 代理。
---

# Go 代码审查

此命令调用 **go-reviewer** 代理进行全面的 Go 特定代码审查。

## 命令功能

1. **识别 Go 变更**：通过 `git diff` 查找修改的 `.go` 文件
2. **运行静态分析**：执行 `go vet`、`staticcheck` 和 `golangci-lint`
3. **安全扫描**：检查 SQL 注入、命令注入、竞态条件
4. **并发审查**：分析 goroutine 安全性、通道使用、互斥锁模式
5. **惯用 Go 检查**：验证代码遵循 Go 约定和最佳实践
6. **生成报告**：按严重程度分类问题

## 何时使用

以下情况使用 `/ucc-go-review`：
- 编写或修改 Go 代码后
- 提交 Go 变更前
- 审查包含 Go 代码的 Pull Request
- 入职新的 Go 代码库
- 学习惯用 Go 模式

## 审查类别

### 关键（必须修复）
- SQL/命令注入漏洞
- 无同步的竞态条件
- Goroutine 泄漏
- 硬编码凭据
- 不安全的指针使用
- 关键路径忽略错误

### 高优先级（应该修复）
- 缺少带上下文的错误包装
- 使用 panic 而非错误返回
- Context 未传播
- 无缓冲通道导致死锁
- 接口不满足错误
- 缺少互斥锁保护

### 中优先级（考虑）
- 非惯用代码模式
- 导出函数缺少 godoc 注释
- 低效字符串拼接
- 切片未预分配
- 未使用表驱动测试

## 自动检查

```bash
# 静态分析
go vet ./...

# 高级检查（如已安装）
staticcheck ./...
golangci-lint run

# 竞态检测
go build -race ./...

# 安全漏洞
gosec ./...
govulncheck ./...
```

## 批准标准

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 | 无关键或高优先级问题 |
| ⚠️ 警告 | 仅有中优先级问题（可谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |

## 与其他命令集成

- 先用 `/ucc-go-test` 确保测试通过
- 如遇构建错误用 `/ucc-go-build`
- 提交前用 `/ucc-go-review`
- 非 Go 特定问题用 `/ucc-code-review`

## 相关

- 代理：`agents/go-reviewer.md`
- 技能：`skills/golang-patterns/`、`skills/golang-testing/`
