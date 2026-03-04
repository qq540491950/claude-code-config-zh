#!/usr/bin/env node

'use strict'

const { log, output, readStdinJson } = require('../lib/utils')

const sensitivePatterns = [
  { label: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'Google API Key', regex: /\bAIza[0-9A-Za-z\-_]{35}\b/ },
  { label: 'OpenAI 风格密钥', regex: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { label: '私钥块', regex: /-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----/ },
]

function collectWritePayloadText(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return ''

  const chunks = []
  for (const key of ['content', 'newString', 'text']) {
    const value = toolInput[key]
    if (typeof value === 'string' && value.length > 0) {
      chunks.push(value)
    }
  }

  if (Array.isArray(toolInput.edits)) {
    toolInput.edits.forEach((edit) => {
      if (!edit || typeof edit !== 'object') return
      for (const key of ['newString', 'newText', 'text']) {
        const value = edit[key]
        if (typeof value === 'string' && value.length > 0) {
          chunks.push(value)
        }
      }
    })
  }

  return chunks.join('\n')
}

function detectSensitive(content) {
  const hits = []
  for (const pattern of sensitivePatterns) {
    if (pattern.regex.test(content)) {
      hits.push(pattern.label)
    }
  }
  return hits
}

async function main() {
  const input = await readStdinJson()
  const payloadText = collectWritePayloadText(input?.tool_input)
  const hits = detectSensitive(payloadText)

  if (hits.length > 0) {
    log(`[Hook] 警告: 检测到疑似敏感信息 (${hits.join(', ')})，请改为环境变量或密钥管理。`)
  }

  output(input)
}

main().catch((err) => {
  log(`[Hook] pretool-sensitive-write-check 异常: ${String(err)}`)
  process.exit(0)
})
