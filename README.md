# Claude Code 精简配置 - 中文版

> 适用于 Golang、Python、Vue 开发者的开箱即用配置

## 📁 目录结构

```
claude-code-config-zh/
├── CLAUDE.md                    # 主配置文件（放在项目根目录）
├── AGENTS.md                    # 代理配置说明
├── README.md                    # 本使用指南
│
├── rules/                       # 编码规范
│   ├── common/                  # 通用规范
│   ├── golang/                  # Go 语言规范
│   ├── python/                  # Python 语言规范
│   └── vue/                     # Vue/TypeScript 规范
│
├── agents/                      # 代理配置
│   ├── planner.md               # 规划代理
│   ├── tdd-guide.md             # TDD 指导代理
│   ├── code-reviewer.md         # 代码审查代理
│   ├── security-reviewer.md     # 安全审查代理
│   ├── go-reviewer.md           # Go 代码审查代理
│   └── python-reviewer.md       # Python 代码审查代理
│
├── commands/                    # 斜杠命令
│   ├── plan.md                  # /plan 实现规划
│   ├── tdd.md                   # /tdd 测试驱动开发
│   ├── code-review.md           # /code-review 代码审查
│   ├── go-review.md             # /go-review Go 审查
│   ├── python-review.md         # /python-review Python 审查
│   └── verify.md                # /verify 验证命令
│
└── skills/                      # 技能模块
    ├── golang-patterns/         # Go 开发模式
    ├── python-patterns/         # Python 开发模式
    ├── frontend-patterns/       # 前端开发模式
    └── tdd-workflow/            # TDD 工作流
```

## 🚀 快速开始

### 方式一：复制到项目根目录

```bash
# 复制配置文件
cp claude-code-config-zh/CLAUDE.md your-project/
cp -r claude-code-config-zh/rules your-project/
cp -r claude-code-config-zh/agents your-project/
cp -r claude-code-config-zh/commands your-project/
cp -r claude-code-config-zh/skills your-project/
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
cp -r claude-code-config-zh/{rules,agents,commands,skills} ~/.claude/
```

## 🌐 不同 AI CLI 工具兼容性

### 格式对比

| 工具 | 配置格式 | 兼容性 |
|------|---------|--------|
| **Claude Code** | `CLAUDE.md` + `rules/` | ✅ 完全兼容 |
| **Codex CLI** | `AGENTS.md` + `.codex/` | ⚠️ 需要转换 |
| **Cursor** | `.cursor/rules` | ⚠️ 需要转换 |
| **Gemini CLI** | 各自格式 | ⚠️ 需要转换 |
| **Qwen CLI** | 各自格式 | ⚠️ 需要转换 |

### 核心概念通用

虽然格式不同，但以下概念是**通用的**：

| 概念 | 说明 | 迁移建议 |
|------|------|---------|
| **规则 (rules)** | 编码规范和约束 | 可直接复制内容 |
| **代理 (agents)** | 专业任务处理器 | 改写为对应格式 |
| **命令 (commands)** | 用户可调用的指令 | 改写为对应格式 |
| **技能 (skills)** | 工作流和领域知识 | 可直接复制内容 |

### 迁移到其他工具

**Codex CLI 迁移：**
```bash
# 将 CLAUDE.md 重命名为 AGENTS.md
# 创建 .codex/ 目录存放配置
mkdir .codex
cp rules .codex/
```

**Cursor 迁移：**
```bash
# 创建 .cursor 目录
mkdir .cursor/rules
cp rules/* .cursor/rules/
```

**通用原则：**
- 规则内容可直接复用
- 代理/命令需要按目标工具格式调整
- 核心编码规范对所有工具都有效

## 📖 使用说明

### 核心命令

| 命令 | 用途 | 示例场景 |
|------|------|---------|
| `/plan` | 实现规划 | 开始新功能前规划步骤 |
| `/tdd` | 测试驱动开发 | 先写测试再实现 |
| `/code-review` | 代码审查 | 完成代码后检查质量 |
| `/go-review` | Go 代码审查 | Go 项目专用 |
| `/python-review` | Python 代码审查 | Python 项目专用 |
| `/verify` | 验证检查 | 提交前验证构建、测试 |

### 工作流程

```
1. 需求分析 → /plan 创建实现计划
2. 测试先行 → /tdd 指导 TDD 开发
3. 编码实现 → 按规则编写代码
4. 代码审查 → /code-review 检查质量
5. 安全检查 → 确保无安全问题
6. 验证通过 → /verify 确认可提交
```

### 根据项目类型选择配置

#### Golang 项目
- 使用 `rules/golang/` 下的所有规范
- 代码审查使用 `go-reviewer` 代理
- 测试使用表驱动模式

#### Python 项目
- 使用 `rules/python/` 下的所有规范
- 代码审查使用 `python-reviewer` 代理
- 测试使用 pytest 框架

#### Vue/前端项目
- 使用 `rules/vue/` 下的所有规范
- 组件使用 Composition API
- 测试使用 Vitest + Playwright

## 🔧 自定义扩展

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

## ✅ 检查清单

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

## 📋 常用工具命令

### Golang

```bash
go fmt -w .                    # 格式化
go vet ./...                   # 静态检查
go test -race -cover ./...     # 测试
gosec ./...                    # 安全扫描
```

### Python

```bash
black .                        # 格式化
ruff check .                   # 静态检查
pytest --cov=src               # 测试
bandit -r .                    # 安全扫描
```

### Vue/TypeScript

```bash
npm run format                 # 格式化
npm run lint                   # 静态检查
npm run test:coverage          # 测试
npx playwright test            # E2E 测试
```

## 🔗 相关资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Go 语言规范](https://go.dev/doc/effective_go)
- [PEP 8 Python 风格指南](https://peps.python.org/pep-0008/)
- [Vue 风格指南](https://vuejs.org/style-guide/)

## 📝 更新日志

- **v1.0.0** - 初始版本，支持 Golang、Python、Vue 开发
- **v1.1.0** - 添加 commands 和 skills 模块，支持其他 CLI 工具迁移说明

---

**提示**：此配置为精简版，适合新手快速上手。核心编码规范对所有 AI CLI 工具通用，只需调整格式即可迁移。