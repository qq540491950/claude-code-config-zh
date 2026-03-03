#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'CLAUDE.md',
  'hooks/hooks.json',
  'agents/doc-updater.md',
  'agents/e2e-runner.md',
  'commands/update-docs.md',
  'commands/e2e.md',
  'rules/javascript/coding-style.md',
  'rules/javascript/security.md',
  'rules/javascript/testing.md',
  'rules/javascript/patterns.md',
  'skills/node-backend-patterns/SKILL.md',
  'skills/design-collaboration/SKILL.md',
]

function checkExists(file) {
  return fs.existsSync(path.join(root, file))
}

function validateHooksJson() {
  const content = fs.readFileSync(path.join(root, 'hooks/hooks.json'), 'utf8')
  const parsed = JSON.parse(content)
  if (!parsed.hooks || !parsed.hooks.PreToolUse || !parsed.hooks.Stop) {
    throw new Error('hooks.json 缺少 hooks.PreToolUse 或 hooks.Stop')
  }
}

function main() {
  const missing = requiredFiles.filter((file) => !checkExists(file))
  if (missing.length > 0) {
    console.error('缺失文件:')
    missing.forEach((file) => console.error(`- ${file}`))
    process.exit(1)
  }

  validateHooksJson()
  console.log('配置校验通过')
}

main()
