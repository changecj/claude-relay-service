# Windows 快捷命令使用指南

## 📋 概述

为了方便在 Windows 命令行中快速管理 Claude Relay Service，我们提供了一系列 bat 脚本，可以放在 PATH 环境变量中，实现全局调用。

## 🚀 安装步骤

### 1. 复制脚本到 PATH 目录

将以下脚本文件复制到 PATH 环境变量中的任意目录（推荐放在一个专门的目录，如 `C:\tools\crs\`）：

- `crs-start.bat` - 重启服务
- `crs-status.bat` - 查看服务状态
- `crs-stop.bat` - 停止服务
- `crs-logs.bat` - 查看日志

### 2. 设置环境变量（可选）

如果你想自定义项目路径，可以设置环境变量 `CRS_HOME`：

```cmd
# 临时设置（当前 CMD 窗口有效）
set CRS_HOME=D:\gopath\src\github.com\claude-relay-service

# 永久设置（需要重启 CMD）
setx CRS_HOME "D:\gopath\src\github.com\claude-relay-service"
```

如果不设置 `CRS_HOME`，脚本会使用默认路径：`D:\gopath\src\github.com\claude-relay-service`

### 3. 验证安装

打开新的 CMD 窗口，执行：

```cmd
crs-status
```

如果能看到服务状态，说明安装成功！

## 📝 可用命令

### crs-start
重启服务（daemon 模式）

```cmd
crs-start
```

**功能：**
- 自动定位到项目目录
- 执行 `npm run service:restart:daemon`
- 显示执行结果

### crs-status
查看服务运行状态

```cmd
crs-status
```

**功能：**
- 显示服务是否正在运行
- 显示进程 ID（如果运行中）

### crs-stop
停止服务

```cmd
crs-stop
```

**功能：**
- 停止正在运行的服务
- 清理 PID 文件

### crs-logs
查看服务日志

```cmd
crs-logs
```

**功能：**
- 显示最近的日志（默认 50 行）

## 💡 使用示例

### 日常使用流程

```cmd
# 1. 查看服务状态
crs-status

# 2. 如果需要重启服务
crs-start

# 3. 查看日志确认服务正常
crs-logs

# 4. 停止服务（如果需要）
crs-stop
```

### 更新服务后重启

```cmd
# 更新代码后
cd D:\gopath\src\github.com\claude-relay-service
git pull
npm install
npm run build:web

# 重启服务（可以在任何目录执行）
crs-start
```

## ⚙️ 自定义配置

### 修改默认项目路径

编辑脚本文件，修改这一行：

```bat
set "PROJECT_DIR=D:\gopath\src\github.com\claude-relay-service"
```

改为你的实际项目路径。

### 添加更多命令

你可以参考现有脚本，创建更多命令，例如：

- `crs-test.bat` - 运行测试
- `crs-update.bat` - 更新服务
- `crs-config.bat` - 查看配置

## ❓ 常见问题

### 1. 提示"项目目录不存在"

**原因：** 脚本找不到项目目录

**解决方法：**
- 检查脚本中的默认路径是否正确
- 或者设置环境变量 `CRS_HOME` 指向正确的项目路径

### 2. 提示"未找到 package.json"

**原因：** 项目路径不正确

**解决方法：** 确认路径指向正确的项目根目录（包含 package.json 的目录）

### 3. 命令不识别

**原因：** 脚本不在 PATH 环境变量中

**解决方法：**
- 确认脚本文件已复制到 PATH 目录
- 重新打开 CMD 窗口
- 检查 PATH 环境变量是否正确设置

## 🎯 最佳实践

1. **统一管理脚本：** 将所有脚本放在同一个目录（如 `C:\tools\crs\`），并将该目录添加到 PATH
2. **使用环境变量：** 如果项目路径可能变化，使用 `CRS_HOME` 环境变量
3. **定期检查：** 使用 `crs-status` 定期检查服务状态
4. **查看日志：** 遇到问题时，使用 `crs-logs` 查看详细日志

## 📚 相关文档

- [本地部署指南](./本地部署Claude-Relay-Service指南.md)
- [Windows代理设置指南](./Windows代理设置完整指南.md)

