const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const required = [
  'AGENTS.md',
  'README.md',
  '.agents/skills',
  '.codex/config.toml',
  '.codex/rules/default.rules',
  '.codex/scripts/notify-turn-end.js',
  'docs/MIGRATION.md',
  'docs/USAGE.md',
]

required.forEach((rel) => {
  assert.ok(fs.existsSync(path.join(root, rel)), `缺少路径: ${rel}`)
})

console.log('config-smoke.test.js 通过')

