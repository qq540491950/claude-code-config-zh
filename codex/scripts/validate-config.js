#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const runtimeRoots = ['AGENTS.md', 'README.md', '.agents', '.codex', 'docs']
const requiredFiles = [
  'AGENTS.md',
  'README.md',
  '.codex/config.toml',
  '.codex/rules/default.rules',
  '.codex/scripts/notify-turn-end.js',
  '.codex/templates/config.minimal.toml',
  '.codex/templates/config.full.toml',
  'docs/MIGRATION.md',
  'docs/USAGE.md',
  'scripts/copy-config.js',
  'scripts/validate-config.js',
  'tests/run-all.js',
]

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function readText(relPath) {
  return fs.readFileSync(path.join(root, relPath), 'utf8')
}

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath))
}

function listFilesRecursive(relPath) {
  const abs = path.join(root, relPath)
  if (!exists(relPath)) return []
  const stats = fs.statSync(abs)
  if (stats.isFile()) return [relPath]

  const out = []
  function walk(current, base) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      const rel = path.posix.join(base, entry.name)
      if (entry.isDirectory()) {
        walk(full, rel)
      } else if (entry.isFile()) {
        out.push(rel)
      }
    }
  }
  walk(abs, relPath)
  return out.sort()
}

function extractFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  return match ? match[1] : null
}

function validateRequiredFiles() {
  const missing = requiredFiles.filter((file) => !exists(file))
  assert(missing.length === 0, `缺失文件:\n- ${missing.join('\n- ')}`)
}

function validateAgentsEntry() {
  const content = readText('AGENTS.md')
  assert(content.includes('UCC'), 'AGENTS.md 缺少 UCC 标识')
  assert(content.includes('$ucc-'), 'AGENTS.md 缺少 $ucc-* 技能入口说明')
  assert(content.includes('/ucc-*'), 'AGENTS.md 应包含旧命令退役说明')
  assert(content.includes('AGENTS.override.md'), 'AGENTS.md 缺少分层发现说明')
}

function validateSkillsPath() {
  const skillsRoot = '.agents/skills'
  assert(exists(skillsRoot), '缺少 .agents/skills 目录')
  const dirs = fs
    .readdirSync(path.join(root, skillsRoot), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  assert(dirs.length > 0, '.agents/skills 目录为空')
  assert(dirs.includes('ucc-router'), '缺少 ucc-router 技能')

  for (const dir of dirs) {
    const skillPath = path.posix.join(skillsRoot, dir, 'SKILL.md')
    assert(exists(skillPath), `${skillPath} 不存在`)
    const content = readText(skillPath)
    const fm = extractFrontmatter(content)
    assert(fm, `${skillPath} 缺少 frontmatter`)
    assert(/^name:\s*.+$/m.test(fm), `${skillPath} 缺少 name`)
    assert(/^description:\s*.+$/m.test(fm), `${skillPath} 缺少 description`)
  }
}

function validateNoLegacyCommandRuntime() {
  assert(!exists('commands'), '运行态不应存在 commands/ 目录')
  assert(!exists('hooks/hooks.json'), '运行态不应依赖 hooks/hooks.json')
}

function validateRulesSyntax() {
  const file = '.codex/rules/default.rules'
  const content = readText(file)
  const blockRegex = /prefix_rule\s*\(\s*([\s\S]*?)\)\s*/g
  const blocks = [...content.matchAll(blockRegex)].map((m) => m[1])
  assert(blocks.length > 0, 'default.rules 缺少 prefix_rule')

  blocks.forEach((block, idx) => {
    assert(/pattern\s*=/.test(block), `prefix_rule[${idx}] 缺少 pattern`)
    assert(/decision\s*=/.test(block), `prefix_rule[${idx}] 缺少 decision`)
    const decisionMatch = block.match(/decision\s*=\s*"([^"]+)"/)
    assert(decisionMatch, `prefix_rule[${idx}] decision 格式错误`)
    assert(
      ['allow', 'prompt', 'forbidden'].includes(decisionMatch[1]),
      `prefix_rule[${idx}] decision 非法: ${decisionMatch[1]}`,
    )
  })
}

function validateConfigKeys() {
  const content = readText('.codex/config.toml')
  const requiredKeys = [
    'approval_policy',
    'sandbox_mode',
    'web_search',
    'project_doc_fallback_filenames',
    'project_doc_max_bytes',
    'notify',
  ]

  requiredKeys.forEach((key) => {
    const re = new RegExp(`^${key}\\s*=`, 'm')
    assert(re.test(content), `config.toml 缺少关键配置: ${key}`)
  })
}

function validateNoClaudeRuntimeReferences() {
  const forbidden = [/~\/\.claude/i, /\\\.claude[\\/]/i, /CLAUDE\.md/i, /claude-code-settings/i]
  const hits = []

  const files = runtimeRoots.flatMap((rel) => listFilesRecursive(rel))
  files.forEach((file) => {
    const text = readText(file)
    const lines = text.split(/\r?\n/)
    lines.forEach((line, index) => {
      for (const pattern of forbidden) {
        if (pattern.test(line)) {
          hits.push(`${file}:${index + 1} -> ${line.trim()}`)
          break
        }
      }
    })
  })

  assert(hits.length === 0, `运行态存在 Claude 残留引用:\n- ${hits.join('\n- ')}`)
}

function runStep(name, fn) {
  fn()
  console.log(`[OK] ${name}`)
}

function main() {
  const steps = [
    ['关键文件存在性', validateRequiredFiles],
    ['AGENTS 入口', validateAgentsEntry],
    ['Skills 路径规范', validateSkillsPath],
    ['运行态目录约束', validateNoLegacyCommandRuntime],
    ['.rules 语法', validateRulesSyntax],
    ['config.toml 关键键', validateConfigKeys],
    ['禁止 Claude 运行态残留', validateNoClaudeRuntimeReferences],
  ]

  const errors = []
  for (const [name, fn] of steps) {
    try {
      runStep(name, fn)
    } catch (err) {
      errors.push({ name, message: err.message })
    }
  }

  if (errors.length > 0) {
    console.error('配置校验失败:')
    errors.forEach((err) => console.error(`- ${err.name}: ${err.message}`))
    process.exit(1)
  }

  console.log('配置校验通过')
}

main()
