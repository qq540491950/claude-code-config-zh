const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const bannedSlashCommands = [
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

const bannedCommandFiles = [
  'commands/plan.md',
  'commands/tdd.md',
  'commands/code-review.md',
  'commands/learn.md',
  'commands/skill-create.md',
  'commands/javascript-review.md',
  'commands/go-review.md',
  'commands/go-test.md',
  'commands/go-build.md',
  'commands/test-coverage.md',
  'commands/e2e.md',
  'commands/verify.md',
  'commands/checkpoint.md',
  'commands/context.md',
  'commands/build-fix.md',
  'commands/update-docs.md',
  'commands/sessions.md',
  'commands/refactor-clean.md',
  // Windows 示例
  'commands\\plan.md',
  'commands\\tdd.md',
  'commands\\code-review.md',
  'commands\\learn.md',
  'commands\\skill-create.md',
  'commands\\javascript-review.md',
  'commands\\go-review.md',
  'commands\\go-test.md',
  'commands\\go-build.md',
  'commands\\test-coverage.md',
  'commands\\e2e.md',
  'commands\\verify.md',
  'commands\\checkpoint.md',
  'commands\\context.md',
  'commands\\build-fix.md',
  'commands\\update-docs.md',
  'commands\\sessions.md',
  'commands\\refactor-clean.md',
]

const scanExtensions = new Set(['.md', '.js', '.json'])
const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'out', '.next', '.turbo'])

function listFilesRec(dir) {
  /** @type {string[]} */
  const results = []

  /** @param {string} current */
  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)

      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) continue
        walk(full)
        continue
      }

      if (!entry.isFile()) continue
      const ext = path.extname(entry.name).toLowerCase()
      if (!scanExtensions.has(ext)) continue
      results.push(full)
    }
  }

  walk(dir)
  return results
}

function scanFile(absPath) {
  let text
  try {
    text = fs.readFileSync(absPath, 'utf8')
  } catch {
    return []
  }

  const rel = path.relative(root, absPath)
  const lines = text.split(/\r?\n/)
  /** @type {{needle: string, line: number, preview: string}[]} */
  const hits = []

  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i]

    for (const needle of bannedSlashCommands) {
      const idx = lineText.indexOf(needle)
      if (idx !== -1) {
        hits.push({ needle, line: i + 1, preview: lineText.trim().slice(0, 240) })
      }
    }

    for (const needle of bannedCommandFiles) {
      const idx = lineText.indexOf(needle)
      if (idx !== -1) {
        hits.push({ needle, line: i + 1, preview: lineText.trim().slice(0, 240) })
      }
    }
  }

  return hits.map((h) => ({ ...h, file: rel }))
}

const files = listFilesRec(root)
/** @type {{file: string, needle: string, line: number, preview: string}[]} */
const allHits = []

for (const abs of files) {
  allHits.push(...scanFile(abs))
}

if (allHits.length > 0) {
  const msg = allHits
    .map((h) => `- ${h.file}:${h.line} 命中 ${h.needle} | ${h.preview}`)
    .join('\n')
  assert.fail(`发现未命名空间化的旧斜杠命令或旧 commands 文件引用，请改为 /ucc-* 或 commands/ucc-*.md：\n${msg}`)
}

console.log('command-namespace.test.js 通过')
