#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')

function readPayload() {
  try {
    const raw = fs.readFileSync(0, 'utf8').trim()
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

const payload = readPayload()
const event = payload.event || 'turn_complete'
const turnId = payload.turn_id || payload.turnId || 'unknown'
const msg = `[UCC notify] event=${event} turn=${turnId} reminder=请执行最小验证后再交付。`

if (process.stderr && process.stderr.write) {
  process.stderr.write(`${msg}\n`)
} else {
  console.log(msg)
}

