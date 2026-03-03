# Claude Code 精简配置 - 中文版

> 适用于 Golang、JavaScript、TypeScript/Vue 开发者的开箱即用配置

## 目录结构

```
claude-code-config-zh/
├── CLAUDE.md                    # 主配置文件（放在项目根目录）
├── AGENTS.md                    # 代理配置说明
├── README.md                    # 本使用指南
│
├── contexts/                    # 工作模式上下文（3个）
│   ├── dev.md                   # 开发模式上下文
│   ├── review.md                # 审查模式上下文
│   └── research.md              # 研究模式上下文
│
├── rules/                       # 编码规范
│   ├── common/                  # 通用规范（9个文件）
│   ├── golang/                  # Go 语言规范（5个文件）
│   ├── javascript/              # JavaScript 规范（5个文件）
│   └── typescript/              # TypeScript/Vue 规范（5个文件）
│
├── agents/                      # 代理配置（9个）
│   ├── planner.md               # 规划代理
│   ├── tdd-guide.md             # TDD 指导代理
│   ├── code-reviewer.md         # 代码审查代理
│   ├── security-reviewer.md     # 安全审查代理
│   ├── build-error-resolver.md  # 构建错误修复代理
│   ├── doc-updater.md           # 文档同步代理
│   ├── e2e-runner.md            # E2E 测试代理
│   ├── go-reviewer.md           # Go 代码审查代理
│   └── javascript-reviewer.md   # JS/TS/Vue 代码审查代理
│
├── commands/                    # 斜杠命令（12个）
│   ├── plan.md                  # /plan 实现规划
│   ├── tdd.md                   # /tdd 测试驱动开发
│   ├── code-review.md           # /code-review 代码审查
│   ├── build-fix.md             # /build-fix 构建错误修复
│   ├── update-docs.md           # /update-docs 文档同步
│   ├── e2e.md                   # /e2e 端到端测试
│   ├── go-review.md             # /go-review Go 审查
│   ├── javascript-review.md     # /javascript-review JS/TS 审查
│   ├── verify.md                # /verify 验证命令
│   ├── sessions.md              # /sessions 会话管理
│   ├── test-coverage.md         # /test-coverage 覆盖率分析
│   └── context.md               # /context 工作模式切换
│
├── skills/                      # 技能模块（11个）
│   ├── golang-patterns/         # Go 开发模式
│   ├── golang-testing/          # Go 测试模式
│   ├── javascript-patterns/     # JavaScript 核心模式
│   ├── frontend-patterns/       # 前端开发模式（React/Vue）
│   ├── node-backend-patterns/   # Node 后端模式
│   ├── search-first/            # 先研究后编码工作流
│   ├── e2e-testing/             # Playwright E2E 测试模式
│   ├── api-design/              # REST API 设计模式
│   ├── security-review/         # 安全审查流程
│   ├── design-collaboration/    # 设计协作模式
│   └── tdd-workflow/            # TDD 工作流
│
├── scripts/                     # 工具脚本
│   ├── lib/                     # 工具函数库
│   │   └── utils.js             # 跨平台工具函数
│   └── validate-config.js       # 配置验证脚本
│
├── hooks/                       # 轻量自动化（可选启用）
│   ├── hooks.json               # 轻量 hooks（风险命令阻断 + 提醒）
│   └── README.md                # 启用说明
│
├── docs/                        # 文档
│   └── CUSTOMIZATION_GUIDE.md   # 配置定制指南
│
└── tests/                       # 基础可用性自测
    ├── run-all.js
    ├── config-smoke.test.js
    └── hooks-json.test.js
```

## 快速开始

### 方式一：复制到项目根目录

```bash
# 复制配置文件
cp claude-code-config-zh/CLAUDE.md your-project/
cp -r claude-code-config-zh/rules your-project/
cp -r claude-code-config-zh/agents your-project/
cp -r claude-code-config-zh/commands your-project/
cp -r claude-code-config-zh/skills your-project/
cp -r claude-code-config-zh/contexts your-project/
```

### 方式二：全局配置

```bash
# Windows
mkdir %USERPROFILE%\.claude
copy claude-code-config-zh\CLAUDE.md %USERPROFILE%\.claude\
xcopy /E /I claude-code-config-zh\rules %USERPROFILE%\.claude\rules

# macOS/Linux
mkdir -p ~/.claude
cp claude-code-config-zh/CLAUDE.md ~/.claude/
cp -r claude-code-config-zh/{rules,agents,commands,skills,contexts} ~/.claude/
```

## 不同 AI CLI 工具兼容性

### 格式对比

| 工具 | 配置格式 | 兼容性 |
|------|---------|--------|
| **Claude Code** | `CLAUDE.md` + `rules/` | 完全兼容 |
| **Codex CLI** | `AGENTS.md` + `.codex/` | 需要转换 |
| **Cursor** | `.cursor/rules` | 需要转换 |
| **Gemini CLI** | 各自格式 | 需要转换 |

### 核心概念通用

虽然格式不同，但以下概念是**通用的**：

| 概念 | 说明 | 迁移建议 |
|------|------|---------|
| **规则 (rules)** | 编码规范和约束 | 可直接复制内容 |
| **代理 (agents)** | 专业任务处理器 | 改写为对应格式 |
| **命令 (commands)** | 用户可调用的指令 | 改写为对应格式 |
| **技能 (skills)** | 工作流和领域知识 | 可直接复制内容 |
| **上下文 (contexts)** | 工作模式切换 | 可直接复制内容 |

## 使用说明

### 工作模式（Contexts）

根据当前任务自动切换工作模式：

| 模式 | 适用场景 | 行为特点 |
|------|---------|---------|
| **开发模式** | 活跃开发、编码、构建 | 先写代码，后解释 |
| **审查模式** | PR 审查、代码分析 | 先读代码，再评论 |
| **研究模式** | 探索、调查、学习 | 先理解，后行动 |

### 核心命令

| 命令 | 用途 | 示例场景 |
|------|------|---------|
| `/context` | 工作模式切换 | 切换开发/审查/研究模式 |
| `/plan` | 实现规划 | 开始新功能前规划步骤 |
| `/tdd` | 测试驱动开发 | 先写测试再实现 |
| `/code-review` | 代码审查 | 完成代码后检查质量 |
| `/build-fix` | 构建错误修复 | 构建或类型检查失败时快速定位修复 |
| `/update-docs` | 文档同步 | 代码变更后同步 README/说明文档 |
| `/e2e` | 端到端测试 | 验证关键用户流程 |
| `/go-review` | Go 代码审查 | Go 项目专用 |
| `/javascript-review` | JS/TS/Vue 代码审查 | 前端项目专用 |
| `/verify` | 验证检查 | 提交前验证构建、测试 |
| `/sessions` | 会话管理 | 管理、加载、别名会话历史 |
| `/test-coverage` | 覆盖率分析 | 分析测试覆盖率并生成缺失测试 |

### 工作流程

```
1. 需求分析 → /plan 创建实现计划
2. 测试先行 → /tdd 指导 TDD 开发
3. 编码实现 → 按规则编写代码
4. 构建异常 → /build-fix 修复构建与类型错误
5. 代码审查 → /code-review 检查质量
6. 覆盖率检查 → /test-coverage 确保测试覆盖
7. 文档同步 → /update-docs 对齐说明
8. 流程回归 → /e2e 覆盖关键路径
9. 安全检查 → 确保无安全问题
10. 验证通过 → /verify 确认可提交
```

### 根据项目类型选择配置

#### Golang 项目
- 使用 `rules/golang/` 下的所有规范
- 代码审查使用 `/go-review` 命令
- 测试使用表驱动模式

#### Vue/前端项目
- 使用 `rules/typescript/` 下的所有规范（Vue 已合并）
- 组件使用 Composition API
- 测试使用 Vitest + Playwright

#### TypeScript（非 Vue）项目
- 使用 `rules/typescript/` 下的所有规范
- 优先保持严格类型与不可变更新
- 测试使用 Vitest/Jest，E2E 使用 Playwright

#### JavaScript/Node 项目
- 使用 `rules/javascript/` 下的所有规范
- 后端开发参考 `skills/node-backend-patterns/`
- 提交前建议执行 `/verify` 与 `/e2e`

### 轻量 Hooks（可选）

- 本仓库提供 `hooks/hooks.json`（Bash 风险命令阻断 + 写入敏感信息提醒 + Stop 提醒）
- 默认不强制启用，保持精简；按需参考 `hooks/README.md` 手动开启

### 团队使用模式（兼顾个人）

- **个人模式（默认）**：保留轻量流程（`/plan → /tdd → /build-fix → /verify`）
- **团队模式（推荐）**：在个人模式基础上增加 `/code-review → /update-docs → /e2e`
- 原则：先保证个人效率，再按项目风险逐步加严团队门禁

## 自定义扩展

### 添加自定义规则

在 `rules/` 目录下创建新文件：

```markdown
---
paths:
  - "**/*.go"
---
# 自定义规则标题

规则内容...
```

### 添加自定义代理

在 `agents/` 目录下创建：

```markdown
---
name: my-agent
description: 代理描述
tools: ["Read", "Write", "Bash"]
model: sonnet
---

代理指令...
```

### 添加自定义命令

在 `commands/` 目录下创建：

```markdown
---
description: 命令描述
---

# 命令名称

命令说明...
```

### 定制配置指南

详细的配置定制流程和示例，请参阅 `docs/CUSTOMIZATION_GUIDE.md`，包括：
- 7 步修改流程
- 个人/团队/企业三种配置方案
- 快速配置模板
- 常见问题解答

## 检查清单

### 提交代码前

- [ ] 代码通过格式化检查
- [ ] 所有测试通过
- [ ] 测试覆盖率 ≥ 80%
- [ ] 无硬编码密钥
- [ ] 无安全漏洞
- [ ] 错误处理完善

### 新功能开发

- [ ] 先写测试（TDD）
- [ ] 代码审查通过
- [ ] 文档已更新
- [ ] 边缘情况已处理

### 文档验收标准（团队）

- [ ] 命令变更已同步 README 的"核心命令"与"工作流程"
- [ ] 代理/规则/技能变更已同步目录结构说明
- [ ] 关键路径变更已补充最小示例或操作步骤
- [ ] 文档中引用的路径均存在且可访问

## 常用工具命令

### Golang

```bash
go fmt -w .                    # 格式化
go vet ./...                   # 静态检查
go test -race -cover ./...     # 测试
gosec ./...                    # 安全扫描
```

### JavaScript/TypeScript

```bash
npm run format                 # 格式化
npm run lint                   # 静态检查
npm run test:coverage          # 测试
npx playwright test            # E2E 测试
```

## 相关资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Go 语言规范](https://go.dev/doc/effective_go)
- [Vue 风格指南](https://vuejs.org/style-guide/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/)

## 更新日志

- **v1.0.0** - 初始版本，支持 Golang、Python、Vue 开发
- **v1.1.0** - 添加 commands 和 skills 模块，支持其他 CLI 工具迁移说明
- **v1.2.0** - 补齐 `/build-fix` 与 `build-error-resolver`，新增 `rules/typescript/` 与可选轻量 hooks
- **v1.3.0** - 新增 `/update-docs`、`/e2e`、`doc-updater`、`e2e-runner`、`rules/javascript/`、Node/设计技能与基础自测
- **v2.0.0** - 移除 Python 支持，Vue 合并到 TypeScript，新增 `javascript-reviewer` 代理，扩展 JS/TS 规则和 Skills
- **v2.1.0** - 新增 `contexts/` 工作模式切换、`scripts/lib/` 工具函数库、新增 `search-first`/`e2e-testing`/`api-design` 技能、新增 `/sessions`/`/test-coverage` 命令
- **v2.2.0** - 新增 `/context` 命令用于快速切换工作模式

---

**提示**：此配置为精简版，适合新手快速上手。核心编码规范对所有 AI CLI 工具通用，只需调整格式即可迁移。
