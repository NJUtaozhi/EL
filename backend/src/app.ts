/**
 * Express 应用配置
 * 注册中间件、路由挂载、全局错误处理
 */
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 路由挂载
app.use('/api', routes)

// 全局错误处理
app.use(errorHandler)

export default app
