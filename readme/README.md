# Claude Relay Service 本地部署工具包

## 📦 包含文件

### 脚本文件
1. **set-proxy.bat** - 代理设置脚本
2. **test-proxy.bat** - 代理测试脚本

### 文档文件
1. **本地部署Claude-Relay-Service指南.md** - 完整部署指南
2. **Windows代理设置完整指南.md** - 代理原理和使用详解

## 🚀 快速开始

### 第一步：设置代理（每次使用前）

1. 确保 Clash/V2Ray 等代理软件正在运行
2. 双击运行 `set-proxy.bat`
3. 会打开一个新的CMD窗口，代理已自动设置

### 第二步：测试代理（可选）

在代理设置后的CMD窗口中：
```cmd
test-proxy.bat
```

查看输出，确认代理工作正常。

### 第三步：启动 CRS 服务

在同一个CMD窗口（代理已设置）：
```cmd
cd claude-relay-service
npm start
```

## 📖 详细说明

### set-proxy.bat 作用

- 自动设置 HTTP_PROXY 和 HTTPS_PROXY 环境变量
- 指向 127.0.0.1:7897（如需修改端口，编辑脚本）
- 打开新CMD窗口，代理设置已生效
- 在这个窗口中启动的所有程序都会使用代理

### test-proxy.bat 作用

- 检查代理端口是否开放
- 测试能否访问 Anthropic API
- 显示详细的连接信息
- 帮助诊断代理问题

## ⚙️ 自定义代理端口

如果你的代理端口不是 7897：

1. 用记事本打开 `set-proxy.bat`
2. 修改这两行：
   ```
   set HTTP_PROXY=http://127.0.0.1:你的端口
   set HTTPS_PROXY=http://127.0.0.1:你的端口
   ```
3. 保存并重新运行

## 🔍 验证代理是否成功

### 成功的标志
```
[√] 看到 "Connected to 127.0.0.1 ... port 7897"
[√] 看到 "Connected to api.anthropic.com"
[√] 收到 HTTP 响应（401 是正常的！）
```

### 失败的标志
```
[X] connection refused
[X] timeout
[X] Failed to connect
```

## 📋 使用流程

```
┌─────────────────────────────────────────┐
│ 1. 双击 set-proxy.bat                    │
│    → 打开新CMD，代理已设置               │
├─────────────────────────────────────────┤
│ 2. (可选) 运行 test-proxy.bat           │
│    → 验证代理工作正常                    │
├─────────────────────────────────────────┤
│ 3. cd claude-relay-service              │
│    npm start                             │
│    → 启动 CRS 服务（使用代理）          │
├─────────────────────────────────────────┤
│ 4. 浏览器打开 http://127.0.0.1:3000/web │
│    → 添加 Claude 账户                    │
├─────────────────────────────────────────┤
│ 5. 创建 API Key                         │
│    设置环境变量                          │
│    → 开始使用 Claude Code                │
└─────────────────────────────────────────┘
```

## ⚠️ 重要提醒

### 关于窗口
- ✅ 代理设置只在**当前CMD窗口**有效
- ✅ 启动服务必须在**同一个窗口**
- ❌ 关闭窗口后代理设置会丢失
- ❌ 新打开的CMD窗口需要重新设置

### 关于代理软件
- ✅ 使用前确保 Clash/V2Ray 正在运行
- ✅ 检查代理端口号是否正确
- ✅ 某些代理软件可能使用不同的端口

### 关于错误信息
- ✅ `401 Unauthorized` = 代理成功（正常错误）
- ❌ `connection refused` = 代理失败
- ❌ `timeout` = 网络问题

## 🆘 遇到问题？

1. **查看详细指南**：
   - 打开 `Windows代理设置完整指南.md`
   - 查看完整的原理说明和故障排除

2. **检查代理端口**：
   ```cmd
   netstat -ano | findstr ":7897"
   ```
   应该看到输出，说明端口开放

3. **查看环境变量**：
   ```cmd
   echo %HTTP_PROXY%
   echo %HTTPS_PROXY%
   ```
   应该显示代理地址

4. **测试代理**：
   ```cmd
   curl https://api.anthropic.com/v1/messages
   ```
   看到 401 就是成功

## 📚 更多信息

详细文档：
- `本地部署Claude-Relay-Service指南.md` - 完整部署步骤
- `Windows代理设置完整指南.md` - 深入理解代理原理

---

祝你使用愉快！有问题随时查阅文档或寻求帮助。
