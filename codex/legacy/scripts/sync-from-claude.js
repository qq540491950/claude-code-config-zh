#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

const codexRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(codexRoot, '..')
const claudeRoot = path.join(repoRoot, 'claude')

const sharedItems = [
  'rules',
  'agents',
  'commands',
  'skills',
  'contexts',
  'hooks',
  'mcp-configs',
  'docs',
  'examples',
]

function printUsage() {
  console.log('用法:')
  console.log('  node codex/scripts/sync-from-claude.js [--dry-run]')
  console.log('')
  console.log('说明:')
  console.log('  - 将 claude/ 下共享目录镜像到 codex/ 下对应目录')
  console.log('  - 目标目录存在时会先删除再复制，以保证内容一致')
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith('-')))
  return {
    help: flags.has('--help') || flags.has('-h'),
    dryRun: flags.has('--dry-run'),
  }
}

function assertPaths() {
  if (!fs.existsSync(claudeRoot) || !fs.statSync(claudeRoot).isDirectory()) {
    throw new Error(`未找到 claude 目录: ${claudeRoot}`)
  }
}

function syncItem(item, dryRun) {
  const src = path.join(claudeRoot, item)
  const dst = path.join(codexRoot, item)

  if (!fs.existsSync(src)) {
    throw new Error(`源目录不存在: ${src}`)
  }

  if (dryRun) {
    console.log(`[DRY-RUN] ${src} -> ${dst}`)
    return
  }

  fs.rmSync(dst, { recursive: true, force: true })
  fs.cpSync(src, dst, { recursive: true, force: true })
  console.log(`[同步] ${item}`)
}

function main() {
  const { help, dryRun } = parseArgs(process.argv.slice(2))
  if (help) {
    printUsage()
    return
  }

  assertPaths()

  sharedItems.forEach((item) => syncItem(item, dryRun))

  if (dryRun) {
    console.log('')
    console.log('Dry-run 完成，未写入文件。')
    return
  }

  console.log('')
  console.log(`同步完成，共 ${sharedItems.length} 项。`)
}

main()
