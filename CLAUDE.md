# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 提供工作指导。

## 项目概述

这是一个 **Claude Code 配置插件** - 包含生产级代理、技能、命令和规则。为 Golang、JavaScript、TypeScript/Vue 开发提供最佳实践工作流。

## 架构说明

项目组织结构：

```
claude-code-config-zh/
├── CLAUDE.md              # 主入口配置
├── AGENTS.md              # 代理协调指南
├── agents/                # 专业代理定义（9个）
├── commands/              # 斜杠命令（11个）
├── contexts/              # 动态上下文注入（3个模式）
│   ├── dev.md             # 开发模式上下文
│   ├── review.md          # 审查模式上下文
│   └── research.md        # 研究模式上下文
├── rules/                 # 编码规范
│   ├── common/            # 通用规则（9个文件）
│   ├── javascript/        # JavaScript 规则（5个文件）
│   ├── typescript/        # TypeScript/Vue 规则（5个文件）
│   └── golang/            # Go 规则（5个文件）
├── skills/                # 工作流定义和领域知识（11个）
├── scripts/               # 工具脚本
│   ├── lib/               # 工具函数库
│   └── validate-config.js # 配置验证
├── hooks/                 # 可选轻量自动化
├── docs/                  # 文档
└── tests/                 # 配置验证测试
```

## 支持的语言

| 语言 | 规则文件 | Skills | 代理 |
|------|---------|--------|------|
| **JavaScript** | 5个（含 hooks） | javascript-patterns, node-backend-patterns | javascript-reviewer |
| **TypeScript/Vue** | 5个（含 hooks） | frontend-patterns | javascript-reviewer |
| **Golang** | 5个（含 hooks） | golang-patterns, golang-testing | go-reviewer |

## 核心命令

### 开发流程

| 命令 | 用途 |
|------|------|
| `/plan` | 实现规划 |
| `/tdd` | 测试驱动开发工作流 |
| `/code-review` | 代码质量审查 |

### 语言特定审查

| 命令 | 用途 |
|------|------|
| `/javascript-review` | JavaScript/TypeScript/Vue 代码审查 |
| `/go-review` | Go 代码审查 |

### 测试与质量

| 命令 | 用途 |
|------|------|
| `/test-coverage` | 分析测试覆盖率，生成缺失测试 |
| `/e2e` | 执行关键流程端到端测试 |
| `/verify` | 综合验证检查 |

### 其他命令

| 命令 | 用途 |
|------|------|
| `/context` | 切换工作模式（dev/review/research）|
| `/build-fix` | 修复构建错误 |
| `/update-docs` | 同步更新文档 |
| `/sessions` | 会话历史管理（列表、加载、别名）|

## 开发规范

### 通用原则

1. **代理优先** — 委托专业代理处理领域任务
2. **测试驱动** — 先写测试再实现，覆盖率要求 80%+
3. **安全第一** — 永不妥协安全；验证所有输入
4. **不可变性** — 始终创建新对象，永不修改现有对象
5. **先计划后执行** — 复杂功能先规划再编码

### 编码风格

- 函数小（<50行），文件专注（<800行）
- 无深层嵌套（>4层）
- 正确的错误处理，无硬编码值
- 可读性好，命名清晰的标识符

### 测试要求

**最低覆盖率: 80%**

测试类型（全部必需）：
1. **单元测试** — 单个函数、工具、组件
2. **集成测试** — API端点、数据库操作
3. **E2E测试** — 关键用户流程

### 安全检查

提交前必须检查：
- [ ] 无硬编码密钥（API密钥、密码、令牌）
- [ ] 所有用户输入已验证
- [ ] SQL注入防护（参数化查询）
- [ ] XSS防护（HTML消毒）
- [ ] 认证/授权已验证
- [ ] 错误消息不泄露敏感数据

## 代理协调

### 主动触发（无需用户请求）

- 代码编写完成 → 立即调用 `code-reviewer` 或语言专用 reviewer
- 安全敏感代码 → 立即调用 `security-reviewer`
- 构建或类型检查失败 → 立即调用 `build-error-resolver`
- 接口/命令/规则调整后 → 立即调用 `doc-updater`

### 按需触发（用户请求）

- 复杂功能需求 → 调用 `planner`
- TDD 开发流程 → 调用 `tdd-guide`
- E2E 测试执行 → 调用 `e2e-runner`

## 可用技能

### 语言特定

| 技能 | 用途 |
|------|------|
| `javascript-patterns` | JS 核心模式、异步处理、闭包陷阱 |
| `node-backend-patterns` | Node.js 后端开发模式 |
| `frontend-patterns` | React/Vue 前端模式 |
| `golang-patterns` | Go 惯用法、并发模式 |
| `golang-testing` | Go 表驱动测试、Mock 策略 |

### 工作流程

| 技能 | 用途 |
|------|------|
| `search-first` | 先研究后编码工作流 |
| `tdd-workflow` | TDD 工作流指导 |
| `e2e-testing` | Playwright E2E 测试模式 |
| `api-design` | REST API 设计模式 |

### 质量保证

| 技能 | 用途 |
|------|------|
| `security-review` | 安全审查流程和检查清单 |
| `design-collaboration` | 设计协作流程 |

## 贡献指南

遵循以下格式：
- 代理：Markdown + YAML前置数据（name, description, tools, model）
- 技能：清晰的章节（何时使用、如何工作、示例）
- 命令：Markdown + 描述前置数据
- 规则：清晰的规范和示例

文件命名：小写+连字符（如 `go-reviewer.md`, `tdd-workflow.md`）