---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.vue"
---
# TypeScript/Vue 钩子规则

> 此文件扩展 [common/hooks.md](../common/hooks.md) 添加 TypeScript/Vue 特定内容。

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
          "exclude": ["**/*.test.ts", "**/*.spec.ts"],
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
        }
      ]
    }
  }
}
```

## Pre-push 钩子

### 类型检查

```json
{
  "hooks": {
    "pre-push": {
      "commands": [
        {
          "name": "type-check",
          "command": "tsc --noEmit",
          "message": "TypeScript 类型检查失败"
        },
        {
          "name": "test",
          "command": "npm test",
          "message": "测试失败，请修复后再推送"
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

## Vue 特定检查

### 组件命名检查

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "vue-component-name",
          "pattern": "<script setup lang=\"ts\">",
          "filePattern": "**/*.vue",
          "message": "Vue 组件应使用 <script setup lang=\"ts\">"
        }
      ]
    }
  }
}
```

### 禁止 Options API

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "no-options-api",
          "pattern": "export default\\s+\\{",
          "filePattern": "**/*.vue",
          "message": "请使用 Composition API (<script setup>) 替代 Options API"
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
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'error',
    'no-debugger': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'vue/multi-word-component-names': 'off'
  }
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
  tabWidth: 2
}
```

### lint-staged 配置

```javascript
// lint-staged.config.js
module.exports = {
  '*.{js,jsx,ts,tsx,vue}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ]
}
```

## 快速命令

```bash
# 手动运行检查
npm run lint
npm run type-check
npm run test

# 修复格式问题
npm run format
npm run lint:fix

# 跳过钩子（不推荐）
git commit --no-verify
git push --no-verify
```

## 检查清单

**每次提交前：**
- [ ] 无 console.log/debugger
- [ ] 无 .only 测试
- [ ] ESLint 通过
- [ ] Prettier 格式正确

**每次推送前：**
- [ ] 类型检查通过
- [ ] 测试全部通过
- [ ] 无 TypeScript 错误
