# 快速启动脚本说明

## Windows 用户

双击 **`run.bat`** 或在命令行执行：
```cmd
run.bat
```

脚本会自动：
1. 检查 Python 环境
2. 启动 Flask 开发服务器（监听 0.0.0.0:5000）
3. 输出服务器状态和访问地址

## Linux / macOS 用户

在终端执行：
```bash
chmod +x run.sh
./run.sh
```

## 访问 API

- **公告类型列表**：http://127.0.0.1:5000/api/public/notice/types
- **公告列表**：http://127.0.0.1:5000/api/public/notice/list
- **公告详情**：http://127.0.0.1:5000/api/public/notice/detail/{notice_id}

## 停止服务器

按 `Ctrl+C` 停止服务器。

## 调试信息

如果启动失败，脚本会显示错误信息。常见问题：
- `Python 未找到`：请确保 Python 已安装并在 PATH 中
- `模块未找到`：运行 `pip install -r requirements.txt` 安装依赖

## Flask 调试模式

开发服务器默认启用调试模式（`debug=True`），支持：
- 热重载：修改代码会自动重启服务器
- 交互式调试器：出现错误时可在浏览器中调试
- 自动编译：LESS / CSS 等资源自动处理
