#!/usr/bin/env node

'use strict'

const { log, output, readStdinJson } = require('../lib/utils')

const highRiskMatchers = [
  {
    reason: '检测到 rm 删除根目录',
    regex: /\brm\s+-[^\n;|&]*[rf][^\n;|&]*\s+\/(?:\s|$)/i,
  },
  {
    reason: '检测到 rm 删除用户主目录',
    regex: /\brm\s+-[^\n;|&]*[rf][^\n;|&]*\s+~(?:\s|$)/i,
  },
  {
    reason: '检测到 rm 删除根目录通配路径',
    regex: /\brm\s+-[^\n;|&]*[rf][^\n;|&]*\s+(?:\/\*|~\/\*)/i,
  },
  {
    reason: '检测到 Windows 高风险目录删除',
    regex: /\b(?:rmdir|rd)\s+\/s\s+\/q\b/i,
  },
  {
    reason: '检测到 Windows 高风险批量删除',
    regex: /\bdel\s+\/s\s+\/q\b/i,
  },
  {
    reason: '检测到 PowerShell 强制递归删除',
    regex: /\bRemove-Item\b(?=[^\n;|&]*\b-Recurse\b)(?=[^\n;|&]*\b-Force\b)/i,
  },
  {
    reason: '检测到 git clean 删除未跟踪目录',
    regex: /\bgit\s+clean\b(?=[^\n;|&]*\s-f)(?=[^\n;|&]*\s-d)/i,
  },
  {
    reason: '检测到磁盘格式化命令',
    regex: /\b(?:format(?:\.com)?|mkfs(?:\.[a-z0-9]+)?)\b/i,
  },
]

function findFirstMatch(command) {
  if (typeof command !== 'string') return null
  for (const matcher of highRiskMatchers) {
    if (matcher.regex.test(command)) {
      return matcher
    }
  }
  return null
}

async function main() {
  const input = await readStdinJson()
  const command = input?.tool_input?.command || ''
  const match = findFirstMatch(command)

  if (match) {
    log(`[Hook] BLOCKED: ${match.reason}，请人工复核后再执行。`)
    output(input)
    process.exit(2)
  }

  output(input)
}

main().catch((err) => {
  log(`[Hook] pretool-risk-blocker 异常: ${String(err)}`)
  process.exit(0)
})
