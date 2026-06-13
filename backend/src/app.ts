/**
 * Express 应用配置
 * 注册中间件、路由挂载、全局错误处理
 */
import express from 'express'
import cors from 'cors'
import path from 'path'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'
import UPLOAD_DIR from './config/upload'

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 静态文件服务 — 头像等上传资源
app.use('/uploads', express.static(UPLOAD_DIR))

// 路由挂载
app.use('/api', routes)

// 全局错误处理
app.use(errorHandler)

export default app
