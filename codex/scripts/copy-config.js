#!/usr/bin/env node

'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const readline = require('readline')

const sourceRoot = path.resolve(__dirname, '..')
const copyItems = ['AGENTS.md', 'README.md', '.agents', '.codex', 'docs', 'scripts', 'tests']

function printUsage() {
  console.log('用法:')
  console.log('  node codex/scripts/copy-config.js <目标目录> [--force]')
  console.log('  node codex/scripts/copy-config.js')
  console.log('')
  console.log('说明:')
  console.log('  - 复制 Codex 运行态配置（不包含 legacy 历史归档）')
  console.log('  - 未传目标目录时会提示输入')
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith('-')))
  const positional = argv.filter((arg) => !arg.startsWith('-'))
  return {
    help: flags.has('--help') || flags.has('-h'),
    force: flags.has('--force') || flags.has('-f'),
    targetArg: positional[0] || '',
  }
}

function expandHome(inputPath) {
  if (!inputPath) return inputPath
  if (inputPath === '~') return os.homedir()
  if (inputPath.startsWith('~/') || inputPath.startsWith('~\\')) {
    return path.join(os.homedir(), inputPath.slice(2))
  }
  return inputPath
}

function resolveTargetDir(rawInput) {
  const expanded = expandHome(rawInput.trim())
  return path.resolve(process.cwd(), expanded)
}

function isWithinSourceRoot(targetDir) {
  const rel = path.relative(sourceRoot, targetDir)
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
}

function askQuestion(rl, question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer)))
}

async function promptForTargetDir() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  try {
    const answer = await askQuestion(rl, '请输入目标项目目录（可输入 . 表示当前目录）: ')
    return answer.trim()
  } finally {
    rl.close()
  }
}

async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  try {
    const answer = await askQuestion(rl, `${question} [y/N]: `)
    return ['y', 'yes'].includes(answer.trim().toLowerCase())
  } finally {
    rl.close()
  }
}

function ensureTargetDir(targetDir) {
  if (fs.existsSync(targetDir)) {
    const stats = fs.statSync(targetDir)
    if (!stats.isDirectory()) {
      throw new Error(`目标路径不是目录: ${targetDir}`)
    }
    return
  }
  fs.mkdirSync(targetDir, { recursive: true })
}

function findConflicts(targetDir) {
  return copyItems.filter((item) => fs.existsSync(path.join(targetDir, item)))
}

function copyOneItem(item, targetDir, force) {
  const src = path.join(sourceRoot, item)
  const dst = path.join(targetDir, item)
  const stats = fs.statSync(src)
  if (stats.isDirectory()) {
    fs.cpSync(src, dst, { recursive: true, force })
  } else {
    fs.cpSync(src, dst, { force })
  }
}

async function main() {
  const { help, force, targetArg } = parseArgs(process.argv.slice(2))
  if (help) {
    printUsage()
    return
  }

  let rawTarget = targetArg
  if (!rawTarget) {
    rawTarget = await promptForTargetDir()
    if (!rawTarget) {
      console.error('未提供目标目录，已退出。')
      process.exit(1)
    }
  }

  const targetDir = resolveTargetDir(rawTarget)
  if (targetDir === sourceRoot || isWithinSourceRoot(targetDir)) {
    console.error(`目标目录不能是 codex 配置目录或其子目录: ${targetDir}`)
    process.exit(1)
  }

  ensureTargetDir(targetDir)

  let shouldForce = force
  const conflicts = findConflicts(targetDir)
  if (conflicts.length > 0 && !shouldForce) {
    console.log('检测到目标目录已存在以下同名文件/目录:')
    conflicts.forEach((item) => console.log(`- ${item}`))
    const confirmed = await confirm('是否覆盖并继续复制？')
    if (!confirmed) {
      console.log('用户取消，未执行复制。')
      process.exit(1)
    }
    shouldForce = true
  }

  copyItems.forEach((item) => {
    copyOneItem(item, targetDir, shouldForce)
    console.log(`[复制] ${item} -> ${path.join(targetDir, item)}`)
  })

  console.log('')
  console.log(`复制完成，共 ${copyItems.length} 项。`)
  console.log(`目标目录: ${targetDir}`)
  console.log('进入目标目录后建议执行: node scripts/validate-config.js')
}

main().catch((err) => {
  console.error(`复制失败: ${err.message}`)
  process.exit(1)
})
