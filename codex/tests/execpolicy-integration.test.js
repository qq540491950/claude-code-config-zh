const assert = require('assert')
const { spawnSync } = require('child_process')
const path = require('path')

const root = path.resolve(__dirname, '..')
const rulesPath = path.join(root, '.codex', 'rules', 'default.rules')
const windowsCodexCmd = process.env.APPDATA
  ? path.join(process.env.APPDATA, 'npm', 'codex.cmd')
  : null

function run(binary, args) {
  return spawnSync(binary, args, {
    cwd: path.resolve(root, '..'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

const candidates = ['codex']
if (windowsCodexCmd) candidates.push(windowsCodexCmd)

let codexRunner = null
for (const candidate of candidates) {
  const check = run(candidate, ['--version'])
  if (check.status === 0) {
    codexRunner = (args) => run(candidate, args)
    break
  }
}

if (!codexRunner && process.platform === 'win32') {
  const check = run('powershell', ['-NoProfile', '-Command', 'codex --version'])
  if (check.status === 0) {
    codexRunner = (args) => {
      const escaped = args.map((arg) => `'${String(arg).replace(/'/g, "''")}'`).join(' ')
      return run('powershell', ['-NoProfile', '-Command', `& codex ${escaped}`])
    }
  }
}

if (!codexRunner) {
  console.log('execpolicy-integration.test.js 跳过（未检测到 codex 命令）')
  process.exit(0)
}

function checkDecision(commandArgs, expectedDecision) {
  const result = codexRunner(['execpolicy', 'check', '--rules', rulesPath, '--', ...commandArgs])
  assert.strictEqual(result.status, 0, `execpolicy 执行失败: ${result.stderr || result.stdout}`)

  const text = (result.stdout || '').trim()
  assert.ok(text.length > 0, 'execpolicy 输出为空')

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    throw new Error(`execpolicy 输出非 JSON: ${text}\n${err.message}`)
  }

  assert.strictEqual(
    parsed.decision,
    expectedDecision,
    `命令 ${commandArgs.join(' ')} 的决策应为 ${expectedDecision}，实际为 ${parsed.decision}`,
  )
}

checkDecision(['rm', '-rf', '/'], 'forbidden')
checkDecision(['git', 'push', '--force', 'origin', 'main'], 'prompt')

console.log('execpolicy-integration.test.js 通过')
