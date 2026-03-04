const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const legacySlashCommands = [
  '/plan',
  '/tdd',
  '/code-review',
  '/learn',
  '/skill-create',
  '/javascript-review',
  '/go-review',
  '/go-test',
  '/go-build',
  '/test-coverage',
  '/e2e',
  '/verify',
  '/checkpoint',
  '/context',
  '/build-fix',
  '/update-docs',
  '/sessions',
  '/refactor-clean',
]

const legacyCommandFileNames = [
  'plan',
  'tdd',
  'code-review',
  'learn',
  'skill-create',
  'javascript-review',
  'go-review',
  'go-test',
  'go-build',
  'test-coverage',
  'e2e',
  'verify',
  'checkpoint',
  'context',
  'build-fix',
  'update-docs',
  'sessions',
  'refactor-clean',
]

// 仅扫描用户入口文档和工作流说明，避免测试/脚本中的自引用误报。
const scanTargets = ['README.md', 'CLAUDE.md', 'docs', 'commands']
const scanExtension = '.md'

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const slashCommandRules = legacySlashCommands.map((command) => ({
  needle: command,
  // 仅命中独立命令，避免将 tests/e2e 等路径误识别为 /e2e 命令。
  regex: new RegExp(`(^|[^\\w-])(${escapeRegExp(command)})(?![\\w-])`),
}))

const legacyCommandFileRules = legacyCommandFileNames.map((name) => ({
  needle: `commands/${name}.md`,
  regex: new RegExp(`(^|[^\\w.-])(commands[\\\\/]${escapeRegExp(name)}\\.md)(?![\\w.-])`, 'i'),
}))

function normalizePath(relPath) {
  return relPath.replace(/\\/g, '/')
}

function isScannableFile(relPath) {
  return relPath.toLowerCase().endsWith(scanExtension)
}

function listTargetFiles(baseDir, target) {
  const absTarget = path.join(baseDir, target)
  if (!fs.existsSync(absTarget)) return []

  const stats = fs.statSync(absTarget)
  if (stats.isFile()) {
    return [absTarget]
  }

  /** @type {string[]} */
  const files = []

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      if (entry.isFile() && isScannableFile(path.relative(baseDir, full))) {
        files.push(full)
      }
    }
  }

  walk(absTarget)
  return files
}

function listFilesForScan() {
  const files = []
  for (const target of scanTargets) {
    files.push(...listTargetFiles(root, target))
  }
  return files.sort()
}

function scanLine(lineText) {
  /** @type {{needle: string, preview: string}[]} */
  const hits = []

  for (const rule of slashCommandRules) {
    if (rule.regex.test(lineText)) {
      hits.push({ needle: rule.needle, preview: lineText.trim().slice(0, 240) })
    }
  }

  for (const rule of legacyCommandFileRules) {
    if (rule.regex.test(lineText)) {
      hits.push({ needle: rule.needle, preview: lineText.trim().slice(0, 240) })
    }
  }

  return hits
}

/** @type {{file: string, needle: string, line: number, preview: string}[]} */
const allHits = []

for (const absPath of listFilesForScan()) {
  const relPath = normalizePath(path.relative(root, absPath))
  const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/)

  for (let i = 0; i < lines.length; i++) {
    const lineHits = scanLine(lines[i])
    lineHits.forEach((hit) => {
      allHits.push({
        file: relPath,
        needle: hit.needle,
        line: i + 1,
        preview: hit.preview,
      })
    })
  }
}

// 回归场景: 路径片段 tests/e2e 不应被误判为旧命令。
assert.strictEqual(scanLine('testDir: ./tests/e2e').length, 0)
// 回归场景: 测试文件自引用不会进入扫描范围。
assert.strictEqual(
  listFilesForScan().some((p) => normalizePath(path.relative(root, p)) === 'tests/command-namespace.test.js'),
  false,
)
// 回归场景: 用户入口文档中的旧命令应被检测到。
assert.ok(scanLine('请先运行 /plan').some((hit) => hit.needle === '/plan'))

if (allHits.length > 0) {
  const msg = allHits
    .map((h) => `- ${h.file}:${h.line} 命中 ${h.needle} | ${h.preview}`)
    .join('\n')
  assert.fail(`发现未命名空间化的旧斜杠命令或旧 commands 文件引用，请改为 /ucc-* 或 commands/ucc-*.md：\n${msg}`)
}

console.log('command-namespace.test.js 通过')
