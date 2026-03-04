#!/usr/bin/env node

'use strict'

const { log, output, readStdinJson } = require('../lib/utils')

async function main() {
  const input = await readStdinJson()
  log('[Hook] 提醒: 结束前请确认测试、格式化、敏感信息与文档同步（团队模式建议额外执行 /ucc-e2e）。')
  output(input)
}

main().catch((err) => {
  log(`[Hook] stop-delivery-reminder 异常: ${String(err)}`)
  process.exit(0)
})
