---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.mjs"
  - "**/*.cjs"
---
# JavaScript 钩子规则

> 此文件扩展 [common/hooks.md](../common/hooks.md) 添加 JavaScript/Node 特定内容。

## Pre-commit 钩子

### 代码格式检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "prettier",
          "command": "prettier --check .",
          "message": "代码格式不符合 Prettier 规范，运行: npm run format"
        },
        {
          "name": "eslint",
          "command": "eslint . --max-warnings 0",
          "message": "ESLint 检查失败，请修复后再提交"
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
          "name": "no-console",
          "pattern": "console\\.(log|debug|info|warn)",
          "exclude": ["**/*.test.js", "**/*.spec.js", "tests/**"],
          "message": "发现 console.log，请移除后再提交"
        },
        {
          "name": "no-debugger",
          "pattern": "debugger",
          "message": "发现 debugger 语句，请移除后再提交"
        },
        {
          "name": "no-only",
          "pattern": "(describe|it|test)\\.only",
          "message": "发现 .only 测试，请移除后再提交"
        },
        {
          "name": "no-alert",
          "pattern": "alert\\(",
          "message": "发现 alert()，请使用其他方式提示用户"
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
          "name": "no-hardcoded-secrets",
          "patterns": [
            "password\\s*[=:]\\s*['\"]",
            "api_key\\s*[=:]\\s*['\"]",
            "secret\\s*[=:]\\s*['\"]",
            "token\\s*[=:]\\s*['\"](?!process\\.env)"
          ],
          "message": "发现可能的硬编码密钥，请使用环境变量"
        },
        {
          "name": "no-eval",
          "pattern": "eval\\s*\\(",
          "message": "发现 eval()，可能存在安全风险"
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
          "name": "test",
          "command": "npm test",
          "message": "测试失败，请修复后再推送"
        },
        {
          "name": "lint",
          "command": "npm run lint",
          "message": "Lint 检查失败，请修复后再推送"
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

## Node.js 特定检查

### 包管理检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "no-package-lock-conflict",
          "pattern": "<<<<<<<",
          "filePattern": "package-lock.json",
          "message": "package-lock.json 存在合并冲突，请解决后再提交"
        }
      ]
    }
  }
}
```

### 环境变量检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "env-example-sync",
          "command": "diff -q .env.example .env 2>/dev/null || echo '请确保 .env.example 与 .env 同步'",
          "message": ".env.example 可能与 .env 不同步"
        }
      ]
    }
  }
}
```

## 工具配置

### ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'warn',
  },
}
```

### Prettier 配置

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  printWidth: 100,
  tabWidth: 2,
}
```

### lint-staged 配置

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,jsx,mjs,cjs}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,md}': [
    'prettier --write',
  ],
}
```

### Husky 配置

```javascript
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

```javascript
// .husky/pre-push
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

## 快速命令

```bash
# 手动运行检查
npm run lint
npm run test
npm run format

# 修复格式问题
npm run lint:fix
npm run format

# 跳过钩子（不推荐）
git commit --no-verify
git push --no-verify
```

## 检查清单

**每次提交前：**
- [ ] 无 console.log/debugger
- [ ] 无 .only 测试
- [ ] 无硬编码密钥
- [ ] ESLint 通过
- [ ] Prettier 格式正确

**每次推送前：**
- [ ] 测试全部通过
- [ ] Lint 检查通过
- [ ] 无安全警告
