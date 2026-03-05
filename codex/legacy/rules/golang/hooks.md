---
paths:
  - "**/*.go"
---
# Go 钩子规则

> 此文件扩展 [common/hooks.md](../common/hooks.md) 添加 Go 特定内容。

## Pre-commit 钩子

### 代码格式检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "gofmt",
          "command": "gofmt -l . | grep -q . && exit 1 || exit 0",
          "message": "代码格式不符合 gofmt 规范，运行: gofmt -w ."
        },
        {
          "name": "goimports",
          "command": "goimports -l . | grep -q . && exit 1 || exit 0",
          "message": "导入格式不符合规范，运行: goimports -w ."
        },
        {
          "name": "go-vet",
          "command": "go vet ./...",
          "message": "Go vet 检查失败，请修复后再提交"
        }
      ]
    }
  }
}
```

### Lint 检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "golangci-lint",
          "command": "golangci-lint run",
          "message": "GolangCI Lint 检查失败，请修复后再提交"
        },
        {
          "name": "golint",
          "command": "golint -set_exit_status ./...",
          "message": "Golint 检查失败，请修复后再提交"
        }
      ]
    }
  }
}
```

### 禁止调试代码

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "no-fmt-print",
          "pattern": "fmt\\.Print(ln|f)?\\s*\\(",
          "exclude": ["**/*_test.go", "examples/**"],
          "message": "发现 fmt.Print，生产代码请使用 log 包"
        },
        {
          "name": "no-log-fatal",
          "pattern": "log\\.Fatal(ln|f)?\\s*\\(",
          "exclude": ["cmd/**", "main.go"],
          "message": "log.Fatal 会立即退出，请在 main 包中使用"
        }
      ]
    }
  }
}
```

### 安全检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "gosec",
          "command": "gosec ./...",
          "message": "安全检查失败，请修复安全问题后再提交"
        },
        {
          "name": "no-hardcoded-secrets",
          "patterns": [
            "password\\s*[=:]\\s*\"[^\"]+\"",
            "api_key\\s*[=:]\\s*\"[^\"]+\"",
            "secret\\s*[=:]\\s*\"[^\"]+\""
          ],
          "message": "发现可能的硬编码密钥，请使用环境变量"
        }
      ]
    }
  }
}
```

## Pre-push 钩子

```json
{
  "hooks": {
    "pre-push": {
      "commands": [
        {
          "name": "go-test",
          "command": "go test ./...",
          "message": "测试失败，请修复后再推送"
        },
        {
          "name": "go-test-race",
          "command": "go test -race ./...",
          "message": "竞态检测失败，请修复后再推送"
        },
        {
          "name": "go-mod-tidy",
          "command": "go mod tidy && git diff --exit-code go.mod go.sum",
          "message": "go.mod/go.sum 有变化，请运行 go mod tidy"
        }
      ]
    }
  }
}
```

## Commit-msg 钩子

```json
{
  "hooks": {
    "commit-msg": {
      "pattern": "^(feat|fix|refactor|docs|test|chore|perf|ci|style)(\\(.+\\))?:\\s.+",
      "message": "提交消息格式错误。格式: <类型>(<范围>): <描述>\n示例: feat(auth): 添加用户登录功能"
    }
  }
}
```

## 工具配置

### golangci-lint 配置

```yaml
# .golangci.yml
run:
  timeout: 5m
  skip-dirs:
    - vendor
    - testdata

linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - ineffassign
    - typecheck
    - gosimple
    - goconst
    - gocyclo
    - dupl
    - misspell

linters-settings:
  govet:
    check-shadowing: true
  gocyclo:
    min-complexity: 15
  goconst:
    min-len: 3
    min-occurrences: 3

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - dupl
        - gosec
```

### Makefile 常用命令

```makefile
.PHONY: fmt lint test cover clean

fmt:
	gofmt -w .
	goimports -w .

lint:
	golangci-lint run

test:
	go test -v ./...

test-race:
	go test -race ./...

cover:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

security:
	gosec ./...

clean:
	go clean
	rm -f coverage.out
```

### pre-commit 配置

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: go-fmt
        name: go fmt
        entry: gofmt -l -w
        language: system
        types: [go]

      - id: go-imports
        name: go imports
        entry: goimports -w
        language: system
        types: [go]

      - id: go-vet
        name: go vet
        entry: go vet ./...
        language: system
        types: [go]
        pass_filenames: false

      - id: golangci-lint
        name: golangci-lint
        entry: golangci-lint run
        language: system
        types: [go]
        pass_filenames: false
```

## 快速命令

```bash
# 格式化代码
gofmt -w .
goimports -w .

# 运行检查
go vet ./...
golangci-lint run
gosec ./...

# 运行测试
go test ./...
go test -race ./...
go test -cover ./...

# 查看覆盖率
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
go tool cover -html=coverage.out

# 模块管理
go mod tidy
go mod verify

# 跳过钩子（不推荐）
git commit --no-verify
git push --no-verify
```

## 检查清单

**每次提交前：**
- [ ] gofmt 格式正确
- [ ] goimports 导入正确
- [ ] go vet 通过
- [ ] 无 fmt.Print（使用 log）

**每次推送前：**
- [ ] 测试全部通过
- [ ] 竞态检测通过
- [ ] Lint 检查通过
- [ ] 安全检查通过
- [ ] go.mod/go.sum 无变化
