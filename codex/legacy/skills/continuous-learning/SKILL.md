---
name: continuous-learning
description: 自动从 Claude Code 会话中提取可复用模式并保存为学习技能。
origin: ECC
---

# 持续学习技能

在会话结束时自动评估 Claude Code 会话，提取可保存为学习技能的可复用模式。

## 激活时机

- 设置从 Claude Code 会话自动提取模式
- 配置 Stop hook 进行会话评估
- 审查或管理 `~/.claude/skills/learned/` 中的学习技能
- 调整提取阈值或模式类别
- 比较 v1（本版本）与 v2（基于本能）的方法

## 工作原理

此技能作为 **Stop hook** 在每个会话结束时运行：

1. **会话评估**：检查会话是否有足够消息（默认：10+）
2. **模式检测**：从会话中识别可提取的模式
3. **技能提取**：将有用的模式保存到 `~/.claude/skills/learned/`

## 配置

编辑 `config.json` 自定义：

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## 模式类型

| 模式 | 描述 |
|---------|-------------|
| `error_resolution` | 特定错误如何被解决 |
| `user_corrections` | 来自用户更正的模式 |
| `workarounds` | 框架/库怪异问题的解决方案 |
| `debugging_techniques` | 有效的调试方法 |
| `project_specific` | 项目特定约定 |

## Hook 设置

添加到你的 `~/.claude/settings.json`：

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## 为什么用 Stop Hook？

- **轻量**：仅在会话结束时运行一次
- **非阻塞**：不给每条消息增加延迟
- **完整上下文**：可访问完整会话记录

## 相关

- `/ucc-learn` 命令 - 会话中手动提取模式

---

## 对比说明

### vs 本能系统（v2）

本能系统采用更复杂的方法：

| 特性 | 本方法 | 本能系统 v2 |
|---------|--------------|---------------|
| 观察 | Stop hook（会话结束） | PreToolUse/PostToolUse hooks（100% 可靠） |
| 分析 | 主上下文 | 后台代理（Haiku） |
| 粒度 | 完整技能 | 原子"本能" |
| 置信度 | 无 | 0.3-0.9 加权 |
| 演进 | 直接到技能 | 本能 → 聚类 → 技能/命令/代理 |
| 共享 | 无 | 导出/导入本能 |

### v2 潜在增强

1. **基于本能的学习** - 更小的原子行为，带置信度评分
2. **后台观察者** - Haiku 代理并行分析
3. **置信度衰减** - 本能如果被矛盾则失去置信度
4. **领域标记** - 代码风格、测试、git、调试等
5. **演进路径** - 将相关本能聚类为技能/命令
