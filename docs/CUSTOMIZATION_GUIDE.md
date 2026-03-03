# Claude Code 配置定制指南

> 本指南帮助新手将默认配置修改为适合个人或团队的开发配置

## 目录

1. [配置结构总览](#一配置结构总览)
2. [修改优先级](#二修改优先级)
3. [Step 1：确定需求](#step-1确定需求)
4. [Step 2：修改通用规则](#step-2修改通用规则)
5. [Step 3：修改语言规则](#step-3修改语言规则)
6. [Step 4：调整代理配置](#step-4调整代理配置)
7. [Step 5：调整命令配置](#step-5调整命令配置)
8. [Step 6：调整技能模块](#step-6调整技能模块)
9. [Step 7：验证配置](#step-7验证配置)
10. [完整示例方案](#三完整示例方案)

---

## 一、配置结构总览

### 1.1 目录结构

```
claude-code-config-zh/
├── CLAUDE.md              # 主配置入口（必须保留）
├── AGENTS.md              # 代理说明文档
│
├── rules/                 # 【重点】编码规范 - 最常修改
│   ├── common/            # 通用规则（9个文件）
│   ├── javascript/        # JavaScript 规则（5个文件）
│   ├── typescript/        # TypeScript/Vue 规则（5个文件）
│   └── golang/            # Go 规则（5个文件）
│
├── agents/                # 代理配置（9个）
├── commands/              # 斜杠命令（9个）
├── skills/                # 技能模块（8个）
├── hooks/                 # 可选钩子
└── tests/                 # 配置验证测试
```

### 1.2 各目录作用

| 目录 | 作用 | 修改频率 | 新手建议 |
|------|------|---------|---------|
| `rules/` | 定义编码规范、风格、安全要求 | **高** | 从这里开始 |
| `agents/` | 定义代理行为、工具权限 | 中 | 熟悉后再改 |
| `commands/` | 定义用户命令入口 | 低 | 基本不改 |
| `skills/` | 提供领域知识和示例 | 低 | 按需扩展 |
| `hooks/` | 自动化检查 | 低 | 可选启用 |

### 1.3 配置文件格式

所有配置文件使用 **Markdown + YAML Frontmatter** 格式：

```markdown
---
# YAML 前置配置（用 --- 包围）
paths:
  - "**/*.js"
name: my-config
---

# Markdown 内容
## 标题

正文内容...
```

---

## 二、修改优先级

按照以下顺序修改，效率最高：

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: 确定需求                                        │
│  ↓                                                       │
│  Step 2: rules/common/     ← 通用规范（必改）            │
│  ↓                                                       │
│  Step 3: rules/{语言}/     ← 语言规范（按需改）          │
│  ↓                                                       │
│  Step 4: agents/           ← 代理配置（可选）            │
│  ↓                                                       │
│  Step 5: commands/         ← 命令配置（基本不改）        │
│  ↓                                                       │
│  Step 6: skills/           ← 技能扩展（可选）            │
│  ↓                                                       │
│  Step 7: 验证配置                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Step 1：确定需求

### 1.1 填写需求问卷

在修改配置前，先回答以下问题：

| 问题分类 | 具体问题 | 你的答案 |
|---------|---------|---------|
| **技术栈** | 主要使用什么语言？ | ☐ JavaScript ☐ TypeScript ☐ Go |
| | 使用什么框架？ | ☐ Vue ☐ React ☐ Node.js ☐ 原生 |
| **团队规模** | 开发模式？ | ☐ 个人 ☐ 小团队(2-5人) ☐ 大团队(5人以上) |
| **代码质量** | 测试覆盖率要求？ | ☐ 不强制 ☐ 60% ☐ 80% |
| | 代码审查流程？ | ☐ 不需要 ☐ 自查 ☐ 团队审查 |
| **编码风格** | 函数最大行数？ | _____ 行 |
| | 文件最大行数？ | _____ 行 |
| | 缩进风格？ | ☐ 2空格 ☐ 4空格 ☐ Tab |
| **Git规范** | 提交信息格式？ | ☐ 简单 ☐ 常规提交 ☐ 自定义 |
| | 分支策略？ | ☐ 单分支 ☐ Git Flow ☐ GitHub Flow |

### 1.2 需求示例

**示例：个人开发者小明**

```
技术栈：TypeScript + Vue
团队规模：个人开发
测试覆盖率：不强制
代码审查：自查
编码风格：函数<100行，文件<500行，2空格缩进
Git规范：简单提交信息（feat: xxx）
```

**示例：初创团队 ABC**

```
技术栈：JavaScript + Node.js
团队规模：小团队(3人)
测试覆盖率：60%
代码审查：团队审查
编码风格：函数<50行，文件<800行，2空格缩进
Git规范：常规提交格式，GitHub Flow
```

---

## Step 2：修改通用规则

### 2.1 rules/common/ 文件说明

| 文件 | 内容 | 修改建议 |
|------|------|---------|
| `coding-style.md` | 函数大小、命名规范 | **必改** - 调整行数限制 |
| `testing.md` | 测试覆盖率、测试类型 | **必改** - 调整覆盖率要求 |
| `security.md` | 安全检查清单 | 建议保留默认 |
| `git-workflow.md` | 提交格式、分支策略 | 按团队规范修改 |
| `development-workflow.md` | 开发流程 | 按团队流程修改 |
| `agents.md` | 代理使用规则 | 基本不改 |
| `hooks.md` | 钩子规则 | 按需启用 |
| `patterns.md` | 设计模式 | 基本不改 |
| `performance.md` | 性能优化 | 基本不改 |

### 2.2 修改 coding-style.md

**原始内容片段：**

```markdown
## 函数规范

- 函数长度不超过 50 行
- 参数不超过 5 个
- 嵌套层级不超过 4 层

## 文件规范

- 文件长度不超过 800 行
```

**修改示例（个人开发者）：**

```markdown
## 函数规范

- 函数长度不超过 100 行（放宽限制）
- 参数不超过 6 个
- 嵌套层级不超过 5 层（适当放宽）

## 文件规范

- 文件长度不超过 500 行（保持简洁）
```

**修改示例（大团队）：**

```markdown
## 函数规范

- 函数长度不超过 40 行（更严格）
- 参数不超过 4 个
- 嵌套层级不超过 3 层（严格控制）

## 文件规范

- 文件长度不超过 500 行
```

### 2.3 修改 testing.md

**原始内容片段：**

```markdown
## 测试要求

**最低覆盖率: 80%**

测试类型（全部必需）：
1. **单元测试** — 单个函数、工具、组件
2. **集成测试** — API端点、数据库操作
3. **E2E测试** — 关键用户流程
```

**修改示例（个人开发者 - 宽松）：**

```markdown
## 测试要求

**最低覆盖率: 不强制**

测试类型：
1. **单元测试** — 推荐，覆盖核心逻辑
2. **集成测试** — 可选
3. **E2E测试** — 可选，关键功能使用
```

**修改示例（小团队 - 适中）：**

```markdown
## 测试要求

**最低覆盖率: 60%**

测试类型：
1. **单元测试** — 必需
2. **集成测试** — 推荐
3. **E2E测试** — 可选
```

### 2.4 修改 git-workflow.md

**原始内容片段：**

```markdown
## 提交信息规范

### 格式

<类型>: <描述>

### 类型说明

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `refactor` | 重构 |
```

**修改示例（简化版）：**

```markdown
## 提交信息规范

### 格式（简化版）

<类型>: <描述>

### 类型说明（精简为4种）

| 类型 | 说明 |
|------|------|
| `feat` | 新功能/新增 |
| `fix` | 修复问题 |
| `update` | 更新/修改 |
| `other` | 其他变更 |

### 示例

feat: 添加用户登录功能
fix: 修复登录验证失败问题
update: 优化查询性能
other: 更新 README
```

---

## Step 3：修改语言规则

### 3.1 选择需要修改的语言目录

| 你使用的技术 | 需要修改的目录 |
|-------------|---------------|
| JavaScript / Node.js | `rules/javascript/` |
| TypeScript / Vue | `rules/typescript/` |
| Go | `rules/golang/` |

### 3.2 语言规则文件说明

每个语言目录包含 5 个文件：

| 文件 | 内容 | 修改建议 |
|------|------|---------|
| `coding-style.md` | 语言特定编码风格 | 调整命名、格式规范 |
| `patterns.md` | 设计模式和最佳实践 | 按需添加项目特定模式 |
| `security.md` | 语言特定安全问题 | 建议保留默认 |
| `testing.md` | 测试框架和策略 | 调整测试工具偏好 |
| `hooks.md` | 语言特定钩子 | 按需启用 |

### 3.3 修改示例：JavaScript 规则

**修改 `rules/javascript/coding-style.md`：**

**原始内容：**

```markdown
## 可读性

- 函数保持短小，避免超过 50 行
- 优先提前返回，减少深层嵌套
- 变量命名语义化

## 模块与导入

- 导入按"内置模块 / 第三方 / 本地模块"分组
- 删除未使用导入
```

**修改示例（添加项目特定规范）：**

```markdown
## 可读性

- 函数保持短小，避免超过 80 行
- 优先提前返回，减少深层嵌套
- 变量命名语义化

### 命名规范（项目特定）

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 函数 | camelCase | `getUserById` |
| 类 | PascalCase | `UserService` |
| 文件 | kebab-case | `user-service.js` |

## 模块与导入

- 导入按"内置模块 / 第三方 / 本地模块"分组
- 删除未使用导入

### 导入顺序示例

```javascript
// 1. Node.js 内置模块
import fs from 'fs'
import path from 'path'

// 2. 第三方模块
import express from 'express'
import lodash from 'lodash'

// 3. 项目内部模块
import { UserService } from './services/user-service'
import { logger } from './utils/logger'
```
```

### 3.4 修改示例：TypeScript/Vue 规则

**修改 `rules/typescript/coding-style.md`：**

**添加项目特定的 Vue 组件规范：**

```markdown
## Vue 组件规范

### 组件文件结构

```vue
<!-- 1. 模板 -->
<template>
  <div class="component">
    <!-- 模板内容 -->
  </div>
</template>

<!-- 2. 脚本 -->
<script setup lang="ts">
// 导入
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  title: string
}

// Props
const props = defineProps<Props>()

// 响应式状态
const count = ref(0)

// 计算属性
const doubled = computed(() => count.value * 2)

// 方法
function increment() {
  count.value++
}
</script>

<!-- 3. 样式 -->
<style scoped>
.component {
  /* 样式 */
}
</style>
```

### 组件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.vue` |
| 组件目录 | kebab-case | `user-profile/` |
| Props | camelCase | `userName` |
| Events | kebab-case | `@update-user` |
```

---

## Step 4：调整代理配置

### 4.1 代理文件说明

| 代理文件 | 用途 | 是否保留 |
|---------|------|---------|
| `planner.md` | 实现规划 | **保留** |
| `tdd-guide.md` | TDD 开发指导 | 按需保留 |
| `code-reviewer.md` | 通用代码审查 | **保留** |
| `security-reviewer.md` | 安全审查 | **保留** |
| `build-error-resolver.md` | 构建错误修复 | **保留** |
| `doc-updater.md` | 文档同步 | 按需保留 |
| `e2e-runner.md` | E2E 测试 | 按需保留 |
| `go-reviewer.md` | Go 代码审查 | 使用 Go 则保留 |
| `javascript-reviewer.md` | JS/TS 代码审查 | 使用 JS/TS 则保留 |

### 4.2 删除不需要的代理

**个人开发者建议保留：**

```
agents/
├── planner.md              # 规划
├── code-reviewer.md        # 代码审查
├── build-error-resolver.md # 构建修复
└── {你的语言}-reviewer.md  # 语言专用审查
```

**小团队建议保留：**

```
agents/
├── planner.md              # 规划
├── tdd-guide.md           # TDD 指导
├── code-reviewer.md        # 代码审查
├── security-reviewer.md    # 安全审查
├── build-error-resolver.md # 构建修复
├── doc-updater.md          # 文档同步
└── {你的语言}-reviewer.md  # 语言专用审查
```

### 4.3 修改代理行为

**修改 `agents/javascript-reviewer.md` 示例：**

**原始内容片段：**

```markdown
### 高优先级 — 代码质量
- 函数 > 50 行，> 5 个参数
- 深层嵌套（> 4 层）
```

**修改后（调整阈值）：**

```markdown
### 高优先级 — 代码质量
- 函数 > 80 行，> 6 个参数（放宽限制）
- 深层嵌套（> 5 层）
```

---

## Step 5：调整命令配置

### 5.1 命令文件说明

| 命令文件 | 触发方式 | 用途 | 是否保留 |
|---------|---------|------|---------|
| `plan.md` | `/plan` | 实现规划 | **保留** |
| `tdd.md` | `/tdd` | TDD 开发 | 按需保留 |
| `code-review.md` | `/code-review` | 代码审查 | **保留** |
| `build-fix.md` | `/build-fix` | 构建修复 | **保留** |
| `update-docs.md` | `/update-docs` | 文档同步 | 按需保留 |
| `e2e.md` | `/e2e` | E2E 测试 | 按需保留 |
| `verify.md` | `/verify` | 验证检查 | **保留** |
| `go-review.md` | `/go-review` | Go 审查 | 使用 Go 则保留 |
| `javascript-review.md` | `/javascript-review` | JS/TS 审查 | 使用 JS/TS 则保留 |

### 5.2 命令配置基本不需修改

命令文件主要定义"何时使用"、"做什么"，通常不需要修改。

**如果需要修改，示例：**

**修改 `commands/code-review.md` 添加检查项：**

```markdown
## 审查类别

### 新增：项目特定检查

- [ ] 是否符合项目命名规范
- [ ] 是否添加了必要的注释
- [ ] 是否更新了相关文档
```

---

## Step 6：调整技能模块

### 6.1 技能文件说明

| 技能目录 | 内容 | 是否保留 |
|---------|------|---------|
| `javascript-patterns/` | JS 核心模式 | 使用 JS 则保留 |
| `frontend-patterns/` | React/Vue 模式 | 前端项目保留 |
| `node-backend-patterns/` | Node 后端模式 | Node 项目保留 |
| `golang-patterns/` | Go 模式 | 使用 Go 则保留 |
| `golang-testing/` | Go 测试模式 | 使用 Go 则保留 |
| `security-review/` | 安全审查流程 | **保留** |
| `tdd-workflow/` | TDD 工作流 | 按需保留 |
| `design-collaboration/` | 设计协作 | 按需保留 |

### 6.2 添加项目特定技能

**创建新技能文件 `skills/my-project-patterns/SKILL.md`：**

```markdown
---
name: my-project-patterns
description: 项目特定的开发模式和规范
---

# 项目开发模式

## 何时激活

- 开始新功能开发
- 代码审查时
- 新成员入职时

## 项目架构

### 目录结构

```
src/
├── api/           # API 调用
├── components/    # 组件
├── hooks/         # 自定义 Hooks
├── utils/         # 工具函数
├── types/         # 类型定义
└── constants/     # 常量
```

### 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| API 函数 | fetch + 动词 + 名词 | `fetchUserList` |
| Hook | use + 功能 | `useUserList` |
| 组件 | 功能 + 类型 | `UserListCard` |

## 常用模式

### API 调用模式

```typescript
// api/user.ts
import { request } from '@/utils/request'

export async function fetchUserList(params: UserListParams) {
  return request.get<UserListResponse>('/api/users', { params })
}
```

### Hook 模式

```typescript
// hooks/useUserList.ts
import { useQuery } from '@tanstack/vue-query'
import { fetchUserList } from '@/api/user'

export function useUserList(params: Ref<UserListParams>) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUserList(params.value)
  })
}
```
```

---

## Step 7：验证配置

### 7.1 运行验证脚本

```bash
# 验证配置格式
node scripts/validate-config.js

# 运行测试
node tests/run-all.js
```

### 7.2 手动验证清单

```markdown
## 配置验证清单

### 基础检查
- [ ] CLAUDE.md 文件存在于项目根目录
- [ ] rules/ 目录结构完整
- [ ] agents/ 目录中的代理文件格式正确
- [ ] 所有 Markdown 文件语法正确

### 功能检查
- [ ] /plan 命令可以正常触发
- [ ] /code-review 命令可以正常触发
- [ ] 语言特定审查命令正常工作

### 内容检查
- [ ] 规则内容符合团队约定
- [ ] 测试覆盖率要求已调整
- [ ] Git 提交格式规范已配置
```

---

## 三、完整示例方案

### 方案 A：个人开发者配置

**适用场景：** 个人项目、学习项目、小型工具开发

**需求分析：**
- 技术栈：TypeScript + Vue
- 测试：不强制
- 审查：自查
- 风格：宽松

**修改步骤：**

#### 1. 修改 `rules/common/coding-style.md`

```markdown
# 编码风格（个人版）

## 函数规范

- 函数长度不超过 100 行
- 参数不超过 6 个
- 嵌套层级不超过 5 层

## 文件规范

- 文件长度不超过 600 行

## 命名规范

- 变量：camelCase
- 常量：UPPER_SNAKE_CASE
- 函数：camelCase
- 类/组件：PascalCase
```

#### 2. 修改 `rules/common/testing.md`

```markdown
# 测试规范（个人版）

## 测试要求

**覆盖率：不强制**

## 测试策略

1. **核心逻辑** — 建议编写单元测试
2. **工具函数** — 建议编写单元测试
3. **UI 组件** — 可选测试
4. **E2E 测试** — 关键流程可选

## 快速测试命令

```bash
# 运行测试
npm test

# 运行单个文件测试
npm test -- user.test.ts
```
```

#### 3. 删除不需要的文件

```
删除：
- agents/doc-updater.md
- agents/e2e-runner.md
- agents/tdd-guide.md
- commands/update-docs.md
- commands/e2e.md
- commands/tdd.md
- skills/tdd-workflow/
- skills/design-collaboration/

保留：
- agents/planner.md
- agents/code-reviewer.md
- agents/build-error-resolver.md
- agents/javascript-reviewer.md
- commands/plan.md
- commands/code-review.md
- commands/build-fix.md
- commands/javascript-review.md
- commands/verify.md
```

#### 4. 最终目录结构

```
claude-code-config-zh/
├── CLAUDE.md
├── AGENTS.md
├── rules/
│   ├── common/           # 5个文件（已简化）
│   ├── javascript/       # 5个文件
│   └── typescript/       # 5个文件
├── agents/               # 4个代理
├── commands/             # 5个命令
├── skills/               # 5个技能
└── tests/
```

---

### 方案 B：小团队配置

**适用场景：** 2-5人创业团队、敏捷开发

**需求分析：**
- 技术栈：JavaScript + Node.js
- 测试：60% 覆盖率
- 审查：团队审查
- 风格：适中

**修改步骤：**

#### 1. 修改 `rules/common/coding-style.md`

```markdown
# 编码风格（团队版）

## 函数规范

- 函数长度不超过 60 行
- 参数不超过 5 个
- 嵌套层级不超过 4 层

## 文件规范

- 文件长度不超过 600 行
- 按功能模块组织，高内聚低耦合

## 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | camelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY` |
| 函数 | camelCase | `getUserById` |
| 类 | PascalCase | `UserService` |
| 文件 | kebab-case | `user-service.js` |
| 目录 | kebab-case | `user-service/` |
```

#### 2. 修改 `rules/common/testing.md`

```markdown
# 测试规范（团队版）

## 测试要求

**最低覆盖率: 60%**

## 测试类型

1. **单元测试** — 必需，覆盖核心逻辑
2. **集成测试** — 推荐，API 端点测试
3. **E2E 测试** — 可选，关键用户流程

## 测试命令

```bash
# 运行测试
npm test

# 覆盖率报告
npm run test:coverage

# E2E 测试
npm run test:e2e
```

## CI 集成

提交代码时自动运行：
- 单元测试
- 代码覆盖率检查（≥60%）
- Lint 检查
```

#### 3. 修改 `rules/common/git-workflow.md`

```markdown
# Git 工作流（团队版）

## 分支策略

```
main (生产)
  ↑
release/x.x.x (发布)
  ↑
develop (开发)
  ↑
feature/xxx (功能分支)
```

## 提交格式

```
<类型>(<范围>): <描述>

[可选的详细描述]
```

### 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat(auth): 添加登录功能` |
| fix | 修复 | `fix(api): 修复查询错误` |
| refactor | 重构 | `refactor(user): 重构用户服务` |
| docs | 文档 | `docs: 更新 README` |
| test | 测试 | `test(user): 添加用户测试` |
| chore | 杂项 | `chore: 更新依赖` |

## PR 流程

1. 从 `develop` 创建功能分支
2. 开发完成后创建 PR
3. 至少 1 人审批通过
4. CI 通过后合并
```

#### 4. 最终目录结构

```
claude-code-config-zh/
├── CLAUDE.md
├── AGENTS.md
├── rules/
│   ├── common/           # 9个文件（完整保留）
│   ├── javascript/       # 5个文件
│   └── typescript/       # 5个文件（备用）
├── agents/               # 7个代理
│   ├── planner.md
│   ├── tdd-guide.md
│   ├── code-reviewer.md
│   ├── security-reviewer.md
│   ├── build-error-resolver.md
│   ├── doc-updater.md
│   └── javascript-reviewer.md
├── commands/             # 7个命令
├── skills/               # 6个技能
└── tests/
```

---

### 方案 C：企业团队配置

**适用场景：** 5人以上团队、正式项目、高要求

**需求分析：**
- 技术栈：TypeScript + Vue + Node.js
- 测试：80% 覆盖率
- 审查：严格审查
- 风格：严格

**修改步骤：**

#### 1. 保持默认配置，微调阈值

**修改 `rules/common/coding-style.md`：**

```markdown
# 编码风格（企业版）

## 函数规范

- 函数长度不超过 40 行（严格）
- 参数不超过 4 个
- 嵌套层级不超过 3 层（严格）

## 文件规范

- 文件长度不超过 500 行（严格）

## 代码质量要求

- 所有函数必须有 JSDoc 注释
- 复杂逻辑必须有行内注释
- 禁止使用 any 类型
```

#### 2. 启用 Hooks

**修改 `hooks/hooks.json`：**

```json
{
  "hooks": {
    "pre-commit": {
      "checks": [
        {
          "name": "no-console",
          "pattern": "console\\.(log|debug)",
          "message": "请移除 console.log"
        },
        {
          "name": "no-debugger",
          "pattern": "debugger",
          "message": "请移除 debugger"
        },
        {
          "name": "no-hardcoded-secrets",
          "patterns": [
            "password\\s*=\\s*['\"]",
            "api_key\\s*=\\s*['\"]"
          ],
          "message": "禁止硬编码密钥"
        }
      ]
    }
  }
}
```

#### 3. 完整保留所有配置

```
claude-code-config-zh/
├── CLAUDE.md
├── AGENTS.md
├── rules/
│   ├── common/           # 9个文件（完整）
│   ├── javascript/       # 5个文件
│   ├── typescript/       # 5个文件
│   └── golang/           # 5个文件（备用）
├── agents/               # 9个代理（完整）
├── commands/             # 9个命令（完整）
├── skills/               # 8个技能（完整）
├── hooks/                # 启用
└── tests/
```

---

## 四、快速配置模板

### 模板 1：个人开发者快速配置

```bash
# 1. 复制配置到项目
cp CLAUDE.md your-project/
cp -r rules your-project/
cp -r agents your-project/
cp -r commands your-project/
cp -r skills your-project/

# 2. 删除不需要的文件
cd your-project
rm -rf rules/golang                          # 不用 Go
rm agents/doc-updater.md agents/e2e-runner.md agents/tdd-guide.md
rm commands/update-docs.md commands/e2e.md commands/tdd.md
rm -rf skills/tdd-workflow skills/design-collaboration

# 3. 修改 rules/common/coding-style.md（调整行数限制）
# 4. 修改 rules/common/testing.md（降低覆盖率要求）
```

### 模板 2：小团队快速配置

```bash
# 1. 复制配置到项目
cp CLAUDE.md your-project/
cp -r rules your-project/
cp -r agents your-project/
cp -r commands your-project/
cp -r skills your-project/

# 2. 删除不需要的文件
cd your-project
rm -rf rules/golang                          # 不用 Go
rm agents/e2e-runner.md                      # 暂不需要 E2E
rm commands/e2e.md

# 3. 修改配置文件
#    - rules/common/coding-style.md（调整行数限制）
#    - rules/common/testing.md（设置 60% 覆盖率）
#    - rules/common/git-workflow.md（设置提交格式）
```

---

## 五、常见问题

### Q1：修改后配置不生效？

**检查项：**
1. CLAUDE.md 是否在项目根目录
2. 文件格式是否正确（YAML Frontmatter 用 `---` 包围）
3. 路径配置是否正确（`paths:` 字段）

### Q2：如何添加自定义规则？

1. 在 `rules/common/` 或 `rules/{语言}/` 创建新文件
2. 添加 YAML Frontmatter 指定路径
3. 编写规则内容

```markdown
---
paths:
  - "**/*.js"
---
# 自定义规则

规则内容...
```

### Q3：如何禁用某个代理？

直接删除对应的 `.md` 文件即可。

### Q4：如何恢复默认配置？

重新从原始仓库复制配置文件即可。

---

## 六、总结

### 配置修改优先级

```
1. rules/common/          ← 必改
2. rules/{你的语言}/      ← 按需改
3. agents/                ← 删减不需要的
4. commands/              ← 基本不改
5. skills/                ← 可扩展
```

### 新手建议

1. **先使用默认配置** — 熟悉工作流程
2. **从小改动开始** — 先改行数限制、覆盖率
3. **逐步精简** — 删除确定不需要的代理和命令
4. **保留核心** — planner、code-reviewer、build-error-resolver 建议保留

### 验证方法

每次修改后运行：

```bash
node scripts/validate-config.js
node tests/run-all.js
```

---

**文档版本：** v1.0  
**最后更新：** 2026-03-03
