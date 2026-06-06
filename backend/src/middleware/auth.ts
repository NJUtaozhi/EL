/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer token，解析用户信息并注入 req.user
 */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { error } from '../utils/response'

export interface AuthPayload {
  userId: number
  openId?: string
}

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    error(res, '未登录，请先授权', 401, 401)
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload
    req.user = payload
    next()
  } catch {
    error(res, 'token 无效或已过期，请重新登录', 401, 401)
  }
}

/**
 * 可选认证：有 token 则解析，无 token 也放行
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const payload = jwt.verify(token, config.jwt.secret) as AuthPayload
      req.user = payload
    } catch {
      // token 无效也继续，不阻断
    }
  }

  next()
}
