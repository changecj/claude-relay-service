# 本地部署 Claude Relay Service 指南

## 🎯 部署目标
在你的PC上部署CRS服务，通过VPN访问Claude，实现本地免VPN使用Claude Code

## 📋 准备工作

### 系统要求
- Windows/Linux/MacOS 都可以
- 至少 2GB 可用内存
- Node.js 18+ 和 Redis 6+
- PC上有可用的VPN连接

### 检查环境
```bash
# 检查 Node.js 版本
node -v  # 应该 >= 18

# 检查 Redis
redis-cli ping  # 应该返回 PONG
```

## 🚀 部署步骤

### 方式一：使用安装脚本（推荐，Linux/Mac）

```bash
# 1. 下载并运行安装脚本
curl -fsSL https://pincc.ai/manage.sh -o manage.sh
chmod +x manage.sh
./manage.sh install

# 2. 按照提示配置（建议设置）
# - 安装目录: 默认即可
# - 服务端口: 3000（默认）
# - Redis 地址: localhost
# - Redis 端口: 6379
# - Redis 密码: 留空（如果没设置密码）

# 3. 启动服务
crs start

# 4. 查看管理员账号
cat ~/claude-relay-service/data/init.json
```

### 方式二：手动部署（Windows 推荐）

```bash
# 1. 克隆项目
git clone https://github.com/Wei-Shaw/claude-relay-service.git
cd claude-relay-service

# 2. 安装依赖
npm install

# 3. 复制配置文件
cp .env.example .env
cp config/config.example.js config/config.js

# 4. 编辑 .env 文件
# 生成随机密钥（可以在网上找个随机字符串生成器）
JWT_SECRET=你的32位随机字符串
ENCRYPTION_KEY=另一个32位随机字符串

# Redis配置（本地默认即可）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 5. 编辑 config/config.js
# 确保监听本地地址
module.exports = {
  server: {
    port: 3000,
    host: '127.0.0.1'  // 只监听本地，更安全
  },
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
}

# 6. 安装前端依赖并构建
npm run install:web
npm run build:web

# 7. 初始化服务（生成管理员账号）
npm run setup

# 8. 启动服务（Windows用户）
npm run service:start:daemon

# 查看管理员账号
type data\init.json  # Windows
cat data/init.json   # Linux/Mac

# 9. 查看服务状态
npm run service:status
```

### 方式三：Docker 部署（可选）

```bash
# 1. 下载 docker-compose 脚本
curl -fsSL https://pincc.ai/crs-compose.sh -o crs-compose.sh
chmod +x crs-compose.sh
./crs-compose.sh

# 2. 启动
docker-compose up -d

# 3. 查看管理员账号
docker logs claude-relay-service
# 或
cat ./data/init.json
```

## ⚙️ 配置 Claude Code

### 1. 访问管理界面

打开浏览器访问：`http://127.0.0.1:3000/web`

使用 `data/init.json` 中的管理员账号登录

### 2. 添加 Claude 账户

1. 点击「Claude账户」标签
2. 点击「添加账户」
3. 点击「生成授权链接」
   - **注意**：确保你的PC的VPN已开启
   - 在新页面中登录你的Claude账户
   - 完成授权后复制 Authorization Code
4. 粘贴代码完成添加

### 3. 创建 API Key

1. 点击「API Keys」标签
2. 点击「创建新Key」
3. 给Key起个名字（比如"我的本地Key"）
4. 保存并复制生成的 API Key（格式：cr_xxxxx）

## 🎮 使用 Claude Code

### 设置环境变量（重要！）

**Windows (PowerShell):**
```powershell
# 设置环境变量
$env:ANTHROPIC_BASE_URL = "http://127.0.0.1:3000/api/"
$env:ANTHROPIC_AUTH_TOKEN = "你的API_Key"

# 验证设置
echo $env:ANTHROPIC_BASE_URL
echo $env:ANTHROPIC_AUTH_TOKEN

# 使用 Claude Code
claude
```

**Windows (CMD):**
```cmd
set ANTHROPIC_BASE_URL=http://127.0.0.1:3000/api/
set ANTHROPIC_AUTH_TOKEN=你的API_Key

claude
```

**Linux/Mac:**
```bash
# 临时设置（当前终端有效）
export ANTHROPIC_BASE_URL="http://127.0.0.1:3000/api/"
export ANTHROPIC_AUTH_TOKEN="你的API_Key"

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export ANTHROPIC_BASE_URL="http://127.0.0.1:3000/api/"' >> ~/.bashrc
echo 'export ANTHROPIC_AUTH_TOKEN="你的API_Key"' >> ~/.bashrc
source ~/.bashrc

# 使用 Claude Code
claude
```

### VSCode Claude 插件配置

创建或编辑 `~/.claude/config.json`：

```json
{
    "primaryApiKey": "crs"
}
```

Windows 路径：`C:\Users\你的用户名\.claude\config.json`

## 🔍 验证部署

### 检查服务健康状态
```bash
# 方式1：通过浏览器访问
http://127.0.0.1:3000/health

# 方式2：使用 curl
curl http://127.0.0.1:3000/health
```

应该返回类似：
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xx..."
}
```

### 测试 API 连接
```bash
# 测试 API
curl -X POST http://127.0.0.1:3000/api/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: 你的API_Key" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-5-20250929",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

## ⚠️ 重要提醒

### VPN 配置
1. **添加账户时**：必须开启VPN，因为需要访问 claude.ai 进行OAuth授权
2. **日常使用时**：VPN必须保持开启，因为服务需要通过VPN访问Claude API
3. **推荐**：使用全局代理或者给Node.js进程单独设置代理

### 代理设置（可选，如果VPN不是全局代理）

编辑 `config/config.js`：
```javascript
module.exports = {
  // ... 其他配置
  proxy: {
    enabled: true,  // 启用代理
    type: 'http',   // 或 'socks5'
    host: '127.0.0.1',
    port: 1080,     // 你的代理端口
    auth: {         // 如果需要认证
      username: '',
      password: ''
    }
  }
}
```

### 安全建议
- 只在本地监听（127.0.0.1），不要监听 0.0.0.0
- 定期更换 API Key
- 不要将配置文件提交到Git仓库
- 备份 `data/init.json` 文件

## 🛠️ 日常维护

### 查看日志
```bash
# 查看所有日志
npm run service:logs

# 或直接查看日志文件
tail -f logs/combined.log
```

### 服务管理
```bash
# 查看状态
npm run service:status

# 重启服务
npm run service:restart:daemon

# 停止服务
npm run service:stop

# 如果使用脚本安装
crs status   # 查看状态
crs restart  # 重启
crs logs     # 查看日志
```

### 更新服务
```bash
cd claude-relay-service
git pull
npm install
npm run install:web
npm run build:web
npm run service:restart:daemon
```

## ❓ 常见问题

### 1. 服务启动失败
```bash
# 检查端口占用
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# 检查Redis
redis-cli ping
```

### 2. OAuth 授权失败
- 确保VPN已开启
- 检查能否访问 claude.ai
- 清除浏览器缓存重试

### 3. API 请求失败
- 检查环境变量是否正确设置
- 查看服务日志找错误
- 确认Claude账户状态正常

### 4. Windows 服务启动问题
如果 daemon 模式有问题，可以直接运行：
```bash
npm start
```

## 📊 监控使用情况

访问：`http://127.0.0.1:3000/web`

可以看到：
- 每个API Key的使用量
- Token消耗统计
- 请求成功率
- 账户状态

## 🎉 完成！

现在你可以：
1. ✅ 在本地PC上运行CRS服务
2. ✅ 通过VPN连接到Claude API
3. ✅ 在命令行中免VPN使用Claude Code
4. ✅ 通过Web界面管理账户和监控使用

有问题随时查看日志或者项目文档！
