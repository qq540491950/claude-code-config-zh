# Claude Code 配置（`claude/`）

> 适用于 Golang、Vue、JavaScript、Node.js 开发者的开箱即用配置

本目录为 **Claude Code** 的完整配置集合（代理、命令、规则、技能、上下文、钩子与校验脚本）。

> 配置入口已精简为：仅 `CLAUDE.md` 作为 Claude Code 主配置文件。

## 配置标识（Namespace）

为避免与 Claude Code 自带配置或其他团队配置混淆，本配置集使用唯一标识 `UCC`。

- 建议在需要“明确使用本配置集”的请求中加上调用标记：`@ucc`
- 当消息包含 `@ucc` 或通过本仓库 `commands/` 触发斜杠命令时，输出末尾应出现一行：`配置标识：UCC`
- 本仓库的斜杠命令已全部命名空间化为：`/ucc-*`（例如 `/ucc-plan`、`/ucc-tdd`），用于避免命令名冲突

## 目录结构

```
claude/
├── CLAUDE.md                    # 主配置文件（放在项目根目录）
├── README.md                    # 本使用指南
│
├── contexts/                    # 工作模式上下文（3个）
│   ├── dev.md                   # 开发模式上下文
│   ├── review.md                # 审查模式上下文
│   └── research.md              # 研究模式上下文
│
├── rules/                       # 编码规范
│   ├── common/                  # 通用规范
│   ├── golang/                  # Go 语言规范
│   ├── javascript/              # JavaScript 规范
│   └── typescript/              # TypeScript/Vue 规范
│
├── agents/                      # 代理配置
├── commands/                    # 斜杠命令
├── skills/                      # 技能模块
├── mcp-configs/                 # MCP 服务配置模板
├── examples/                    # 项目模板示例
├── scripts/                     # 工具脚本（含校验）
├── hooks/                       # 轻量自动化（可选启用）
└── tests/                       # 基础可用性自测
```

## 快速开始

### 方式一：复制到项目根目录

```bash
# 在本仓库根目录执行
cp claude/CLAUDE.md your-project/
cp -r claude/rules your-project/
cp -r claude/agents your-project/
cp -r claude/commands your-project/
cp -r claude/skills your-project/
cp -r claude/contexts your-project/
```

### 方式二：全局配置

```bash
# Windows（示例）
mkdir %USERPROFILE%\.claude
copy claude\CLAUDE.md %USERPROFILE%\.claude\
xcopy /E /I claude\rules %USERPROFILE%\.claude\rules

# macOS/Linux（示例）
mkdir -p ~/.claude
cp claude/CLAUDE.md ~/.claude/
cp -r claude/{rules,agents,commands,skills,contexts} ~/.claude/
```

### 方式三：使用复制脚本（推荐）

```bash
# 在本仓库根目录执行
node claude/scripts/copy-config.js <目标目录>

# 不传目标目录时会提示输入「项目目录或根目录」
node claude/scripts/copy-config.js
```

## 配置验证（建议改动后执行）

```bash
# 在本仓库根目录执行
node claude/scripts/validate-config.js
node claude/tests/run-all.js
```

## 使用风险提示

- `docs/配置定制指南.md` 中包含 `rmdir /s /q`、`rm -rf` 等删除命令示例：执行前务必确认当前目录与目标路径。
- `mcp-configs/mcp-servers.json` 为模板，含 `YOUR_*_HERE` 占位符与路径占位符：请替换为你自己的环境变量与目录。

## 版本日志

- **v1.0.0** - 初始版本，支持 Golang、Vue 开发（早期曾包含 Python 支持，现已移除）
- **v1.1.0** - 添加 commands 和 skills 模块，支持其他 CLI 工具迁移说明
- **v1.2.0** - 补齐 `/ucc-build-fix` 与 `build-error-resolver`，新增 `rules/typescript/` 与可选轻量 hooks
- **v1.3.0** - 新增 `/ucc-update-docs`、`/ucc-e2e`、`doc-updater`、`e2e-runner`、`rules/javascript/`、Node/设计技能与基础自测
- **v2.0.0** - 移除 Python 支持，Vue 合并到 TypeScript，新增 `javascript-reviewer` 代理，扩展 JS/TS 规则和 Skills
- **v2.1.0** - 新增 `contexts/` 工作模式切换、`scripts/lib/` 工具函数库、新增 `search-first`/`e2e-testing`/`api-design` 技能、新增 `/ucc-sessions`/`/ucc-test-coverage` 命令
- **v2.2.0** - 新增 `/ucc-context` 命令用于快速切换工作模式
- **v2.3.0** - 新增 MCP 服务配置、3个代理（architect、refactor-cleaner、go-build-resolver）、6个命令（/ucc-go-test、/ucc-go-build、/ucc-learn、/ucc-checkpoint、/ucc-skill-create、/ucc-refactor-clean）、2个技能（continuous-learning、verification-loop）、项目模板示例（Go 微服务、Vue+Node）
