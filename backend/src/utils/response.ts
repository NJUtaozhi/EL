/**
 * 统一响应格式
 * 所有接口返回 { code, data, message }
 */
import { Response } from 'express'

export interface ApiResponse<T = any> {
  code: number
  data: T | null
  message: string
}

/**
 * 成功响应
 */
export function success<T>(res: Response, data: T, message = 'ok', code = 200): void {
  res.status(code).json({
    code: 0,
    data,
    message,
  })
}

/**
 * 失败响应
 */
export function error(res: Response, message = '服务器错误', code = 400, httpStatus?: number): void {
  res.status(httpStatus || code).json({
    code,
    data: null,
    message,
  })
}
