#!/usr/bin/env node

/**
 * 测试代理配置是否正常工作
 * 用于验证服务能否通过代理访问 Claude API
 */

const config = require('../config/config')
const ProxyHelper = require('../src/utils/proxyHelper')
const https = require('https')
const logger = require('../src/utils/logger')

async function testProxy() {
  console.log('🔍 开始测试代理配置...\n')

  // 1. 检查代理配置
  console.log('📋 代理配置信息:')
  if (config.proxy?.enabled) {
    console.log(`  ✅ 代理已启用`)
    console.log(`  📍 代理类型: ${config.proxy.type || 'http'}`)
    console.log(`  🌐 代理地址: ${config.proxy.host || '127.0.0.1'}`)
    console.log(`  🔌 代理端口: ${config.proxy.port || 7897}`)
    if (config.proxy.auth?.username) {
      console.log(`  👤 代理认证: 已配置`)
    } else {
      console.log(`  👤 代理认证: 未配置`)
    }
  } else {
    console.log('  ❌ 代理未启用')
    console.log('  💡 提示: 请在 config/config.js 中设置 proxy.enabled = true')
    process.exit(1)
  }

  // 2. 创建代理 Agent
  console.log('\n🔧 创建代理 Agent...')
  const proxyConfig = {
    type: config.proxy.type || 'http',
    host: config.proxy.host || '127.0.0.1',
    port: config.proxy.port || 7897,
    username: config.proxy.auth?.username || '',
    password: config.proxy.auth?.password || ''
  }

  const proxyAgent = ProxyHelper.createProxyAgent(proxyConfig)
  if (!proxyAgent) {
    console.log('  ❌ 无法创建代理 Agent')
    console.log('  💡 请检查代理配置是否正确')
    process.exit(1)
  }
  console.log('  ✅ 代理 Agent 创建成功')

  // 3. 测试访问 Claude API
  console.log('\n🌐 测试访问 Claude API (通过代理)...')
  console.log('  📍 目标: https://api.anthropic.com/v1/messages')

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': 'test-key-for-connection-check' // 使用测试 key，只测试连接
      },
      agent: proxyAgent,
      timeout: 10000
    }

    const req = https.request(options, (res) => {
      console.log(`  📊 响应状态码: ${res.statusCode}`)
      
      if (res.statusCode === 401) {
        // 401 表示连接成功，只是认证失败（这是正常的，因为我们用的是测试 key）
        console.log('  ✅ 代理连接成功！')
        console.log('  ℹ️  401 错误是正常的（测试 key 无效），说明代理工作正常')
        console.log('\n🎉 代理配置验证通过！服务可以通过代理访问 Claude API')
        resolve(true)
      } else if (res.statusCode === 200) {
        console.log('  ✅ 代理连接成功！')
        console.log('\n🎉 代理配置验证通过！')
        resolve(true)
      } else {
        console.log(`  ⚠️  收到状态码: ${res.statusCode}`)
        console.log('  ℹ️  如果状态码不是 401，可能需要检查代理配置')
        resolve(true) // 仍然认为连接成功
      }

      res.on('data', () => {}) // 忽略响应体
      res.on('end', () => {})
    })

    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('  ❌ 连接被拒绝')
        console.log('  💡 可能的原因:')
        console.log('     1. 代理服务未启动')
        console.log('     2. 代理地址或端口配置错误')
        console.log('     3. 防火墙阻止了连接')
      } else if (error.code === 'ETIMEDOUT') {
        console.log('  ❌ 连接超时')
        console.log('  💡 可能的原因:')
        console.log('     1. 代理服务响应慢')
        console.log('     2. 网络连接问题')
        console.log('     3. 代理配置错误')
      } else {
        console.log(`  ❌ 连接失败: ${error.message}`)
        console.log(`  📋 错误代码: ${error.code}`)
      }
      console.log('\n❌ 代理配置验证失败')
      reject(error)
    })

    req.on('timeout', () => {
      console.log('  ❌ 请求超时')
      req.destroy()
      reject(new Error('Request timeout'))
    })

    // 发送一个简单的测试请求
    const testBody = JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    })

    req.write(testBody)
    req.end()
  })
}

// 运行测试
testProxy()
  .then(() => {
    console.log('\n✅ 测试完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 测试失败:', error.message)
    process.exit(1)
  })

