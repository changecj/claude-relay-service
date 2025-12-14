# Windows 代理设置与 CRS 部署完整指南

## 📚 目录
1. [理解整个流程](#理解整个流程)
2. [代理的作用和原理](#代理的作用和原理)
3. [实战操作步骤](#实战操作步骤)
4. [问题诊断](#问题诊断)
5. [高级技巧](#高级技巧)

---

## 🎯 理解整个流程

### 完整的数据流向图

```
┌─────────────────────────────────────────────────────────────┐
│                       你的 Windows PC                        │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐    ┌─────────────┐ │
│  │ Claude Code  │ ───> │ CRS 服务     │ ───>│ 代理软件     │ │
│  │ (命令行工具)  │      │ (Node.js)   │    │ (Clash/V2Ray)│ │
│  └──────────────┘      └──────────────┘    └─────────────┘ │
│         ↑                     ↑                    ↓        │
│         │                     │                    │        │
│         │              监听 127.0.0.1:3000         │        │
│         │                                          │        │
│  设置环境变量指向本地服务                          VPN隧道   │
│  ANTHROPIC_BASE_URL=                               ↓        │
│  http://127.0.0.1:3000/api/                   127.0.0.1:7897│
└─────────────────────────────────────────────────────────────┘
                                                     │
                                              (通过VPN出去)
                                                     ↓
                                         ┌───────────────────┐
                                         │ Claude 官方 API   │
                                         │ api.anthropic.com │
                                         └───────────────────┘
```

### 步骤分解

**第一步：你执行 `claude` 命令**
```
你在CMD输入: claude "写个Hello World"
```

**第二步：Claude Code 读取环境变量**
```
ANTHROPIC_BASE_URL = http://127.0.0.1:3000/api/
→ Claude Code 知道要连接到本地的 CRS 服务
```

**第三步：请求发送到 CRS 服务**
```
请求: http://127.0.0.1:3000/api/v1/messages
→ CRS 服务接收请求（Node.js 程序）
```

**第四步：CRS 需要访问 Claude 官方 API**
```
CRS 尝试连接: https://api.anthropic.com/v1/messages
→ 这里需要代理！因为你在国内/受限地区
```

**第五步：通过代理出去**
```
方式1（环境变量代理）:
   HTTP_PROXY=http://127.0.0.1:7897
   → Node.js 自动通过这个代理访问外网

方式2（配置文件代理）:
   config/config.js 里配置 proxy
   → CRS 服务读取配置，使用代理
```

**第六步：代理软件转发请求**
```
127.0.0.1:7897 (Clash)
→ 通过 VPN 隧道
→ 访问 api.anthropic.com
```

**第七步：返回响应**
```
Claude API → 代理 → CRS → Claude Code → 显示在你的终端
```

---

## 🔌 代理的作用和原理

### 为什么需要代理？

#### 问题场景
```
你在中国 → 直接访问 api.anthropic.com → 被墙/超时
```

#### 解决方案
```
你在中国 → 代理软件（Clash）→ VPN服务器（海外）→ api.anthropic.com
```

### 两种代理配置方式

#### 方式1：环境变量（推荐，简单）

```cmd
REM 临时设置（只在当前CMD窗口有效）
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 所有通过这个窗口启动的程序都会使用这个代理
```

**优点：**
- ✅ 简单，不用改代码
- ✅ 只影响当前窗口，不影响系统
- ✅ 适合测试和临时使用

**缺点：**
- ❌ 关闭窗口后失效
- ❌ 每次打开新窗口都要设置

#### 方式2：配置文件（持久）

在 `config/config.js` 中配置：
```javascript
proxy: {
  enabled: true,
  type: 'http',
  host: '127.0.0.1',
  port: 7897
}
```

**优点：**
- ✅ 永久生效
- ✅ 启动服务自动使用
- ✅ 便于管理

**缺点：**
- ❌ 需要修改代码
- ❌ 修改后需要重启服务

### 代理端口说明

常见代理软件的默认端口：

| 软件 | HTTP端口 | SOCKS5端口 |
|------|---------|-----------|
| **Clash** | 7890/7897 | 7891 |
| **V2Ray** | 10808 | 10809 |
| **Shadowsocks** | - | 1080 |
| **Qv2ray** | 8889 | 1089 |

**如何找到你的代理端口？**

1. **Clash 用户**：
   - 打开 Clash → Settings → Port
   - 查看 "HTTP Proxy Port"
   - 通常是 7890 或 7897

2. **V2Ray 用户**：
   - 查看配置文件
   - HTTP 代理通常在 10808

3. **其他软件**：
   - 查看软件设置中的 "本地代理" 或 "Local Proxy"

---

## 🚀 实战操作步骤

### 准备工作

#### 1. 确保代理软件运行
```cmd
REM 测试代理端口是否开放
netstat -ano | findstr ":7897"

REM 如果看到输出，说明端口开放
REM 如果没有输出，说明代理软件没运行
```

#### 2. 测试代理连接
```cmd
REM 设置代理
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 测试访问（应该返回 401 或其他响应，不是超时）
curl https://api.anthropic.com/v1/messages
```

### 使用脚本（推荐）

#### 脚本1：`set-proxy.bat` - 设置代理

**作用：** 在当前CMD窗口设置代理环境变量

**使用方法：**
```cmd
REM 双击运行 set-proxy.bat
REM 或在CMD中运行
set-proxy.bat

REM 之后在这个窗口中的所有命令都会使用代理
```

#### 脚本2：`test-proxy.bat` - 测试代理

**作用：** 测试代理是否正常工作

**使用方法：**
```cmd
REM 先运行 set-proxy.bat
set-proxy.bat

REM 然后测试
test-proxy.bat
```

### 手动设置（理解原理）

#### Windows CMD
```cmd
REM 设置代理（临时，仅当前窗口）
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 验证设置
echo %HTTP_PROXY%
echo %HTTPS_PROXY%

REM 测试
curl https://api.anthropic.com/v1/messages
```

#### Windows PowerShell
```powershell
# 设置代理
$env:HTTP_PROXY = "http://127.0.0.1:7897"
$env:HTTPS_PROXY = "http://127.0.0.1:7897"

# 验证
echo $env:HTTP_PROXY
echo $env:HTTPS_PROXY

# 测试
curl https://api.anthropic.com/v1/messages
```

---

## 🔍 如何验证代理是否成功

### 验证步骤详解

#### 第一步：检查代理端口
```cmd
netstat -ano | findstr ":7897"

期望输出（代理正常）：
  TCP    127.0.0.1:7897         0.0.0.0:0              LISTENING       12345

如果没有输出：
  → 代理软件没有运行
  → 或端口号不对
```

#### 第二步：测试基本连接
```cmd
REM 不设置代理，直接访问（应该失败）
curl https://api.anthropic.com/v1/messages

期望结果：
  curl: (7) Failed to connect to api.anthropic.com
  或超时

说明：直连被墙，需要代理
```

#### 第三步：设置代理后测试
```cmd
REM 设置代理
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 再次测试
curl -v https://api.anthropic.com/v1/messages
```

**成功的标志：**
```
* Connected to 127.0.0.1 (127.0.0.1) port 7897 (#0)    <-- 连接到代理
...
* Connected to api.anthropic.com (x.x.x.x) port 443     <-- 通过代理连接到API
...
< HTTP/2 401                                            <-- 收到响应（401是正常的）
< content-type: application/json
{
  "error": {
    "type": "authentication_error",
    "message": "x-api-key header is required"
  }
}
```

**失败的标志：**
```
* Trying x.x.x.x...
* connect to x.x.x.x port 443 failed: Timed out        <-- 超时
或
curl: (7) Failed to connect                            <-- 连接失败
```

#### 第四步：详细诊断
```cmd
REM 查看完整的连接过程
curl -v -x http://127.0.0.1:7897 https://api.anthropic.com/v1/messages

REM -v = verbose (详细输出)
REM -x = 指定代理
```

---

## 🔧 完整部署流程

### 一、准备环境

```cmd
REM 1. 确保代理软件运行
REM 2. 确保 Node.js 和 Redis 已安装
node -v
redis-cli ping
```

### 二、部署 CRS 服务

```cmd
REM 1. 克隆项目
git clone https://github.com/Wei-Shaw/claude-relay-service.git
cd claude-relay-service

REM 2. 安装依赖
npm install
npm run install:web
npm run build:web

REM 3. 配置环境
copy .env.example .env
copy config\config.example.js config\config.js

REM 4. 编辑 .env（生成随机密钥）
notepad .env

REM 5. 初始化
npm run setup
```

### 三、启动服务（两种方式）

#### 方式A：使用环境变量代理（推荐）

```cmd
REM 1. 打开一个新的CMD窗口
REM 2. 运行代理设置脚本
set-proxy.bat

REM 3. 在同一个窗口启动服务
cd claude-relay-service
npm start

REM 服务会自动使用代理
```

#### 方式B：使用配置文件代理

```cmd
REM 1. 编辑 config/config.js
notepad config\config.js

REM 添加代理配置：
proxy: {
  enabled: true,
  type: 'http',
  host: '127.0.0.1',
  port: 7897
}

REM 2. 直接启动（无需设置环境变量）
npm start
```

### 四、添加 Claude 账户

```cmd
REM 1. 浏览器访问
http://127.0.0.1:3000/web

REM 2. 使用管理员账号登录（查看 data/init.json）

REM 3. 添加账户（需要 OAuth）
REM    - 点击"添加账户"
REM    - 生成授权链接
REM    - 在新页面完成授权
REM    - 复制 code 回来

REM 注意：这一步必须确保代理生效！
```

### 五、配置 Claude Code

```cmd
REM 1. 创建 API Key（在Web界面）

REM 2. 设置环境变量
set ANTHROPIC_BASE_URL=http://127.0.0.1:3000/api/
set ANTHROPIC_AUTH_TOKEN=你的API_Key

REM 3. 使用
claude
```

---

## 🐛 问题诊断

### 问题1：`curl: (7) Failed to connect`

**原因：** 代理没有正常工作

**解决方法：**
```cmd
REM 1. 检查代理软件是否运行
REM 2. 检查端口是否正确
netstat -ano | findstr ":7897"

REM 3. 确认环境变量已设置
echo %HTTP_PROXY%

REM 4. 重新设置
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897
```

### 问题2：`401 Unauthorized`

**说明：** 这是**正常的**！代理已经成功！

**原因：** API 需要密钥，但测试时没有提供

**确认代理成功的标志：**
- ✅ 看到 `Connected to 127.0.0.1 ... port 7897`
- ✅ 看到 `Connected to api.anthropic.com`
- ✅ 收到 HTTP 响应（即使是 401）

### 问题3：OAuth 授权失败

**原因：** 浏览器没有使用代理

**解决方法：**

1. **确保 Clash 系统代理已开启**
   ```
   Clash → Settings → System Proxy → 开启
   ```

2. **或者使用支持代理的浏览器**
   ```
   Chrome → 设置 → 系统 → 打开代理设置
   ```

3. **或者暂时切换为全局模式**
   ```
   Clash → Global (全局模式)
   ```

### 问题4：CRS 启动后无法访问 API

**诊断：**
```cmd
REM 1. 检查服务是否启动
netstat -ano | findstr ":3000"

REM 2. 检查健康状态
curl http://127.0.0.1:3000/health

REM 3. 查看日志
cd claude-relay-service
type logs\error.log
```

### 问题5：环境变量不生效

**原因：** CMD 窗口作用域问题

**解决：**
```cmd
REM 不要这样（新窗口，环境变量丢失）：
set HTTP_PROXY=http://127.0.0.1:7897
start npm start

REM 应该这样（同一窗口）：
set HTTP_PROXY=http://127.0.0.1:7897
npm start

REM 或使用脚本
set-proxy.bat  （会自动保持窗口）
```

---

## 🎓 高级技巧

### 技巧1：永久设置代理环境变量

#### Windows 系统环境变量
```cmd
REM 方式1：通过系统设置（GUI）
1. Win + R → sysdm.cpl
2. 高级 → 环境变量
3. 系统变量 → 新建
   变量名: HTTP_PROXY
   变量值: http://127.0.0.1:7897
4. 新建 HTTPS_PROXY

REM 方式2：通过命令行（需要管理员权限）
setx HTTP_PROXY "http://127.0.0.1:7897" /M
setx HTTPS_PROXY "http://127.0.0.1:7897" /M

REM 注意：setx 需要重启CMD才生效
```

**缺点：**
- ⚠️ 影响所有程序（包括不需要代理的）
- ⚠️ 代理软件关闭后会导致所有网络请求失败

### 技巧2：创建启动脚本

创建 `start-crs.bat`：
```batch
@echo off
echo 正在启动 Claude Relay Service...

REM 设置代理
set HTTP_PROXY=http://127.0.0.1:7897
set HTTPS_PROXY=http://127.0.0.1:7897

REM 进入项目目录
cd /d %~dp0\claude-relay-service

REM 启动服务
npm start

pause
```

### 技巧3：检测代理是否需要

创建智能启动脚本：
```batch
@echo off
echo 检测网络环境...

REM 测试直连
curl -s -m 3 https://api.anthropic.com/v1/messages >nul 2>&1

if %errorlevel% == 0 (
    echo [√] 可以直连，无需代理
    npm start
) else (
    echo [!] 需要代理
    set HTTP_PROXY=http://127.0.0.1:7897
    set HTTPS_PROXY=http://127.0.0.1:7897
    npm start
)
```

### 技巧4：多代理切换

如果你有多个代理：
```batch
@echo off
echo 选择代理：
echo 1. Clash (7897)
echo 2. V2Ray (10808)
echo 3. 无代理
set /p choice=请选择：

if "%choice%"=="1" (
    set HTTP_PROXY=http://127.0.0.1:7897
    set HTTPS_PROXY=http://127.0.0.1:7897
)
if "%choice%"=="2" (
    set HTTP_PROXY=http://127.0.0.1:10808
    set HTTPS_PROXY=http://127.0.0.1:10808
)

npm start
```

---

## 📝 总结

### 核心要点

1. **两种代理方式**：
   - 环境变量（临时，灵活）
   - 配置文件（永久，稳定）

2. **验证代理成功的标志**：
   - 看到 "Connected to 127.0.0.1 ... port 7897"
   - 收到 HTTP 响应（即使是 401）

3. **常见误区**：
   - ❌ 401 错误不是失败，是成功！
   - ❌ 环境变量只在当前窗口有效
   - ❌ 不同程序可能需要不同的代理设置

4. **最佳实践**：
   - ✅ 使用脚本自动化设置
   - ✅ 先测试代理，再启动服务
   - ✅ 查看详细日志排查问题

### 快速检查清单

部署前检查：
- [ ] Node.js 18+ 已安装
- [ ] Redis 已安装并运行
- [ ] 代理软件（Clash/V2Ray）已运行
- [ ] 代理端口正确（7897 或其他）

启动前检查：
- [ ] 环境变量已设置（或配置文件已配置）
- [ ] 代理连接已测试成功
- [ ] CRS 配置文件已正确设置

运行时检查：
- [ ] CRS 服务正常启动（127.0.0.1:3000）
- [ ] 能访问管理界面
- [ ] OAuth 授权成功
- [ ] Claude Code 可以正常使用

希望这份详细指南能帮你理解整个流程！
