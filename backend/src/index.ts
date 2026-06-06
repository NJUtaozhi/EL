/**
 * 后端入口文件
 * 启动 HTTP 服务器，监听指定端口
 */
import app from './app'
import { config } from './config'

const PORT = config.port || 3000

app.listen(PORT, () => {
  console.log(`🚀 不拖延实验室后端已启动: http://localhost:${PORT}`)
})
