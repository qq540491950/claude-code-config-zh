const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const runtimeRoots = ['AGENTS.md', 'README.md', '.agents', '.codex', 'docs']
const forbidden = [/~\/\.claude/i, /\.claude[\\/]/i, /CLAUDE\.md/i, /claude-code-settings/i]

function listFilesRecursive(relPath) {
  const abs = path.join(root, relPath)
  if (!fs.existsSync(abs)) return []
  const stats = fs.statSync(abs)
  if (stats.isFile()) return [relPath]

  const files = []
  function walk(current, base) {
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      const rel = path.posix.join(base, entry.name)
      if (entry.isDirectory()) {
        walk(full, rel)
      } else if (entry.isFile()) {
        files.push(rel)
      }
    }
  }
  walk(abs, relPath)
  return files
}

const hits = []
for (const relRoot of runtimeRoots) {
  for (const relFile of listFilesRecursive(relRoot)) {
    const lines = fs.readFileSync(path.join(root, relFile), 'utf8').split(/\r?\n/)
    lines.forEach((line, idx) => {
      for (const pattern of forbidden) {
        if (pattern.test(line)) {
          hits.push(`${relFile}:${idx + 1}`)
          break
        }
      }
    })
  }
}

assert.strictEqual(hits.length, 0, `运行态发现 Claude 残留引用:\n${hits.join('\n')}`)
console.log('runtime-no-claude-reference.test.js 通过')
