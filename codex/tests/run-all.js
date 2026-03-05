#!/usr/bin/env node

const { spawnSync } = require('child_process')
const path = require('path')

const repoRoot = path.resolve(__dirname, '..')
const tests = [
  'tests/config-smoke.test.js',
  'tests/skills-integrity.test.js',
  'tests/rules-syntax.test.js',
  'tests/runtime-no-claude-reference.test.js',
  'tests/execpolicy-integration.test.js',
]

for (const test of tests) {
  const abs = path.resolve(repoRoot, test)
  const result = spawnSync('node', [abs], { stdio: 'inherit' })
  if (result.status !== 0) {
    process.exit(result.status || 1)
  }
}

console.log('全部自测通过')
