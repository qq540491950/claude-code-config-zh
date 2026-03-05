const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const rulesPath = path.join(root, '.codex', 'rules', 'default.rules')
assert.ok(fs.existsSync(rulesPath), '缺少 .codex/rules/default.rules')

const content = fs.readFileSync(rulesPath, 'utf8')
const blocks = [...content.matchAll(/prefix_rule\s*\(\s*([\s\S]*?)\)\s*/g)].map((m) => m[1])
assert.ok(blocks.length > 0, '缺少 prefix_rule 规则')

blocks.forEach((block, idx) => {
  assert.ok(/pattern\s*=/.test(block), `prefix_rule[${idx}] 缺少 pattern`)
  assert.ok(/decision\s*=/.test(block), `prefix_rule[${idx}] 缺少 decision`)
  const decision = block.match(/decision\s*=\s*"([^"]+)"/)
  assert.ok(decision, `prefix_rule[${idx}] decision 格式错误`)
  assert.ok(['allow', 'prompt', 'forbidden'].includes(decision[1]), `prefix_rule[${idx}] decision 非法`)
})

console.log('rules-syntax.test.js 通过')

