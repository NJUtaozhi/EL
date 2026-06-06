/**
 * Zod 请求参数校验中间件
 * 对 req.body / req.query / req.params 进行校验
 */
import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { error } from '../utils/response'

type ValidationTarget = 'body' | 'query' | 'params'

/**
 * 创建校验中间件
 * @param schema - Zod schema
 * @param target - 校验目标，默认 body
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target])
      // 用校验后数据替换原数据（有默认值和类型转换）
      req[target] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ')
        error(res, `参数校验失败: ${message}`, 400)
        return
      }
      next(err)
    }
  }
}
