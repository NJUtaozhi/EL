/**
 * 全局错误处理中间件
 * 统一捕获异常并返回 { code, data, message } 格式
 */
import { Request, Response, NextFunction } from 'express'
import { error } from '../utils/response'
import logger from '../utils/logger'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, { stack: err.stack })

  if (err.name === 'ValidationError') {
    error(res, `参数校验失败: ${err.message}`, 400)
    return
  }

  if (err.name === 'UnauthorizedError') {
    error(res, '未授权，请先登录', 401, 401)
    return
  }

  error(res, process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message, 500, 500)
}
