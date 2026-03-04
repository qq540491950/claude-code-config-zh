# 钩子配置规则

> 此文件定义钩子触发规则、前置/后置检查，适用于自动化工作流。

## 钩子类型

### 1. 提交钩子 (Pre-commit)

**触发时机：** 每次 `git commit` 之前

**检查项：**

| 检查项 | 说明 | 失败处理 |
|--------|------|---------|
| 代码格式 | 检查代码是否符合格式规范 | 阻止提交 |
| 无调试代码 | 检查 console.log/debugger 等 | 阻止提交 |
| 无敏感信息 | 检查硬编码密钥 | 阻止提交 |
| 无大文件 | 检查是否添加了大文件 | 阻止提交 |

**配置示例：**

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "no-console",
          "pattern": "console\\.(log|debug|info)",
          "message": "发现 console.log，请移除后再提交"
        },
        {
          "name": "no-debugger",
          "pattern": "debugger",
          "message": "发现 debugger 语句，请移除后再提交"
        },
        {
          "name": "no-hardcoded-secrets",
          "patterns": [
            "password\\s*=\\s*['\"]",
            "api_key\\s*=\\s*['\"]",
            "secret\\s*=\\s*['\"]"
          ],
          "message": "发现可能的硬编码密钥，请使用环境变量"
        }
      ]
    }
  }
}
```

### 2. 推送钩子 (Pre-push)

**触发时机：** 每次 `git push` 之前

**检查项：**

| 检查项 | 说明 | 失败处理 |
|--------|------|---------|
| 测试通过 | 运行单元测试 | 阻止推送 |
| 类型检查 | TypeScript 类型检查 | 阻止推送 |
| 构建成功 | 项目构建检查 | 阻止推送 |

**配置示例：**

```json
{
  "hooks": {
    "pre-push": {
      "commands": [
        {
          "name": "test",
          "command": "npm test",
          "message": "测试失败，请修复后再推送"
        },
        {
          "name": "type-check",
          "command": "npm run type-check",
          "message": "类型检查失败，请修复后再推送"
        }
      ]
    }
  }
}
```

### 3. 提交消息钩子 (Commit-msg)

**触发时机：** 验证提交消息格式

**检查项：**

| 检查项 | 说明 | 失败处理 |
|--------|------|---------|
| 格式验证 | 提交消息符合规范 | 阻止提交 |
| 类型验证 | 提交类型有效 | 阻止提交 |

**配置示例：**

```json
{
  "hooks": {
    "commit-msg": {
      "pattern": "^(feat|fix|refactor|docs|test|chore|perf|ci|style):\\s.+",
      "message": "提交消息格式错误，应为: <类型>: <描述>"
    }
  }
}
```

### 4. 后置钩子 (Post-xxx)

**触发时机：** 操作完成后

**Post-commit 钩子：**
- 更新 changelog
- 发送通知

**Post-merge 钩子：**
- 安装依赖
- 运行数据库迁移
- 清理缓存

**配置示例：**

```json
{
  "hooks": {
    "post-merge": {
      "commands": [
        {
          "name": "install-deps",
          "command": "npm install"
        },
        {
          "name": "clear-cache",
          "command": "npm run clear-cache"
        }
      ]
    }
  }
}
```

## 语言特定钩子

### Python 钩子

```json
{
  "python": {
    "pre-commit": {
      "checks": [
        {
          "name": "black-format",
          "command": "black --check .",
          "message": "代码格式不符合 Black 规范"
        },
        {
          "name": "isort",
          "command": "isort --check-only .",
          "message": "导入顺序不符合规范"
        },
        {
          "name": "flake8",
          "command": "flake8 .",
          "message": "存在 Flake8 警告"
        }
      ]
    }
  }
}
```

### TypeScript/JavaScript 钩子

```json
{
  "javascript": {
    "pre-commit": {
      "checks": [
        {
          "name": "eslint",
          "command": "eslint . --max-warnings 0",
          "message": "ESLint 检查失败"
        },
        {
          "name": "prettier",
          "command": "prettier --check .",
          "message": "代码格式不符合 Prettier 规范"
        }
      ]
    }
  }
}
```

### Go 钩子

```json
{
  "golang": {
    "pre-commit": {
      "checks": [
        {
          "name": "gofmt",
          "command": "gofmt -l .",
          "message": "代码格式不符合 gofmt 规范"
        },
        {
          "name": "go-vet",
          "command": "go vet ./...",
          "message": "Go vet 检查失败"
        },
        {
          "name": "golint",
          "command": "golint ./...",
          "message": "Golint 检查失败"
        }
      ]
    }
  }
}
```

## 钩子配置文件

### 配置位置

```
hooks/
├── hooks.json          # 主配置文件
└── README.md           # 使用说明
```

### 配置结构

```json
{
  "version": "1.0",
  "hooks": {
    "pre-commit": { ... },
    "pre-push": { ... },
    "commit-msg": { ... },
    "post-merge": { ... }
  },
  "languageOverrides": {
    "python": { ... },
    "javascript": { ... },
    "golang": { ... }
  }
}
```

## 检查清单模板

### 提交前检查

```markdown
## 提交前自动检查

- [ ] 无 console.log/debugger
- [ ] 无硬编码密钥
- [ ] 代码格式正确
- [ ] 无语法错误
```

### 推送前检查

```markdown
## 推送前自动检查

- [ ] 单元测试通过
- [ ] 类型检查通过
- [ ] 构建成功
- [ ] 无安全漏洞
```

## 钩子故障排除

### 跳过钩子（不推荐）

```bash
# 跳过 pre-commit 钩子
git commit --no-verify

# 跳过 pre-push 钩子
git push --no-verify
```

### 调试钩子

```bash
# 手动运行 pre-commit 钩子
pre-commit run --all-files

# 运行特定检查
pre-commit run <check-name> --all-files
```

### 更新钩子

```bash
# 更新 pre-commit 钩子
pre-commit autoupdate

# 重新安装钩子
pre-commit install
```

## 最佳实践

1. **保持钩子快速执行：** 每个钩子执行时间应 < 30 秒
2. **提供清晰的错误信息：** 告诉用户如何修复问题
3. **允许临时跳过：** 提供跳过机制，但记录日志
4. **定期更新规则：** 根据项目需求调整检查项
5. **团队统一配置：** 确保所有成员使用相同的钩子配置
