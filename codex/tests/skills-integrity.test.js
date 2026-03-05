const assert = require('assert')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const skillsRoot = path.join(root, '.agents', 'skills')

assert.ok(fs.existsSync(skillsRoot), '缺少 .agents/skills 目录')

const skillDirs = fs
  .readdirSync(skillsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

assert.ok(skillDirs.length > 0, '.agents/skills 为空')
assert.ok(skillDirs.includes('ucc-router'), '缺少 ucc-router 技能')

const fmRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

for (const dir of skillDirs) {
  const skillFile = path.join(skillsRoot, dir, 'SKILL.md')
  assert.ok(fs.existsSync(skillFile), `缺少文件: ${path.relative(root, skillFile)}`)
  const content = fs.readFileSync(skillFile, 'utf8')
  const fmMatch = content.match(fmRegex)
  assert.ok(fmMatch, `${dir}/SKILL.md 缺少 frontmatter`)
  const fm = fmMatch[1]
  assert.ok(/^name:\s*.+$/m.test(fm), `${dir}/SKILL.md 缺少 name`)
  assert.ok(/^description:\s*.+$/m.test(fm), `${dir}/SKILL.md 缺少 description`)
}

console.log('skills-integrity.test.js 通过')

