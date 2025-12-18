/**
 * Codex 认证诊断脚本
 * 用于检查 Codex 配置和环境变量是否正确
 */

const axios = require('axios')
const config = require('../config/config')
const logger = require('../src/utils/logger')

async function testCodexAuth() {
  console.log('🔍 Codex 认证诊断工具\n')
  console.log('='.repeat(60))

  // 1. 检查环境变量
  console.log('\n1️⃣ 检查环境变量 CRS_OAI_KEY:')
  const crsOaiKey = process.env.CRS_OAI_KEY
  if (!crsOaiKey) {
    console.log('   ❌ 环境变量 CRS_OAI_KEY 未设置')
    console.log('   💡 请在 PowerShell 中运行:')
    console.log('      $env:CRS_OAI_KEY = "你的API密钥"')
    console.log('   或者在 CMD 中运行:')
    console.log('      set CRS_OAI_KEY=你的API密钥')
    return
  } else {
    console.log(`   ✅ 环境变量已设置: ${crsOaiKey.substring(0, 10)}...`)
    
    // 检查格式
    if (!crsOaiKey.startsWith('cr_')) {
      console.log('   ⚠️  警告: API Key 应该以 "cr_" 开头')
    } else {
      console.log('   ✅ API Key 格式正确（以 cr_ 开头）')
    }
  }

  // 2. 检查服务是否运行
  console.log('\n2️⃣ 检查服务状态:')
  const baseUrl = 'http://127.0.0.1:3000'
  try {
    const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 })
    console.log('   ✅ 服务正在运行')
    console.log(`   📊 服务版本: ${healthResponse.data.version || 'unknown'}`)
  } catch (error) {
    console.log('   ❌ 无法连接到服务')
    console.log(`   💡 错误: ${error.message}`)
    console.log('   💡 请确保服务已启动: npm run service:start')
    return
  }

  // 3. 测试 API Key 验证
  console.log('\n3️⃣ 测试 API Key 验证:')
  try {
    const testResponse = await axios.post(
      `${baseUrl}/openai/responses`,
      {
        model: 'gpt-5.1-codex',
        messages: [{ role: 'user', content: 'test' }],
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${crsOaiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true // 不抛出错误，手动检查状态码
      }
    )

    if (testResponse.status === 401) {
      console.log('   ❌ API Key 验证失败 (401 Unauthorized)')
      console.log(`   📝 响应: ${JSON.stringify(testResponse.data, null, 2)}`)
      console.log('\n   🔍 可能的原因:')
      console.log('      1. API Key 无效或不存在')
      console.log('      2. API Key 没有 OpenAI 权限')
      console.log('      3. API Key 已被禁用')
      console.log('\n   💡 解决方案:')
      console.log('      1. 访问 http://127.0.0.1:3000/admin-next/api-keys')
      console.log('      2. 检查 API Key 是否存在且已启用')
      console.log('      3. 确认 API Key 已勾选 "OpenAI" 权限')
      console.log('      4. 如果不存在，请创建新的 API Key')
    } else if (testResponse.status === 403) {
      console.log('   ❌ API Key 权限不足 (403 Forbidden)')
      console.log(`   📝 响应: ${JSON.stringify(testResponse.data, null, 2)}`)
      console.log('\n   💡 解决方案:')
      console.log('      1. 访问 http://127.0.0.1:3000/admin-next/api-keys')
      console.log('      2. 编辑你的 API Key')
      console.log('      3. 确保已勾选 "OpenAI" 权限')
    } else if (testResponse.status === 200 || testResponse.status === 201) {
      console.log('   ✅ API Key 验证成功！')
      console.log('   🎉 Codex 应该可以正常使用了')
    } else {
      console.log(`   ⚠️  意外的状态码: ${testResponse.status}`)
      console.log(`   📝 响应: ${JSON.stringify(testResponse.data, null, 2)}`)
    }
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ 请求失败: ${error.response.status}`)
      console.log(`   📝 响应: ${JSON.stringify(error.response.data, null, 2)}`)
    } else {
      console.log(`   ❌ 网络错误: ${error.message}`)
    }
  }

  // 4. 检查配置文件
  console.log('\n4️⃣ 检查 Codex 配置:')
  const fs = require('fs')
  const path = require('path')
  const os = require('os')
  
  const codexConfigPath = path.join(os.homedir(), '.codex', 'config.toml')
  const codexAuthPath = path.join(os.homedir(), '.codex', 'auth.json')
  
  console.log(`   📁 Config 文件: ${codexConfigPath}`)
  if (fs.existsSync(codexConfigPath)) {
    const configContent = fs.readFileSync(codexConfigPath, 'utf-8')
    console.log('   ✅ Config 文件存在')
    
    // 检查关键配置
    if (configContent.includes('model_provider = "crs"')) {
      console.log('   ✅ model_provider 配置正确')
    } else {
      console.log('   ⚠️  未找到 model_provider = "crs"')
    }
    
    if (configContent.includes('base_url = "http://127.0.0.1:3000/openai"')) {
      console.log('   ✅ base_url 配置正确')
    } else {
      console.log('   ⚠️  base_url 可能不正确')
    }
    
    if (configContent.includes('env_key = "CRS_OAI_KEY"')) {
      console.log('   ✅ env_key 配置正确')
    } else {
      console.log('   ⚠️  未找到 env_key = "CRS_OAI_KEY"')
    }
  } else {
    console.log('   ❌ Config 文件不存在')
    console.log('   💡 请创建配置文件并添加必要的配置')
  }
  
  console.log(`\n   📁 Auth 文件: ${codexAuthPath}`)
  if (fs.existsSync(codexAuthPath)) {
    try {
      const authContent = JSON.parse(fs.readFileSync(codexAuthPath, 'utf-8'))
      console.log('   ✅ Auth 文件存在')
      if (authContent.OPENAI_API_KEY === null || authContent.OPENAI_API_KEY === undefined) {
        console.log('   ✅ OPENAI_API_KEY 设置为 null（正确）')
      } else {
        console.log('   ⚠️  OPENAI_API_KEY 应该设置为 null')
      }
    } catch (error) {
      console.log('   ⚠️  Auth 文件格式错误')
    }
  } else {
    console.log('   ⚠️  Auth 文件不存在（可选，但建议创建）')
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📋 诊断完成！')
}

// 运行诊断
testCodexAuth().catch((error) => {
  console.error('❌ 诊断过程中出错:', error.message)
  process.exit(1)
})


