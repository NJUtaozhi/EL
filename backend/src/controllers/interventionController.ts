/**
 * 干预方案控制器（第5周完整实现）
 * 处理干预建议生成和策略查询的 HTTP 请求
 */
import { Request, Response, NextFunction } from 'express'
import * as interventionService from '../services/interventionService'
import { success, error } from '../utils/response'
import logger from '../utils/logger'

/**
 * POST /api/intervention/generate
 * 生成个性化干预方案（调 DeepSeek）
 * Body: { procrastinationType: string, taskTitle?: string }
 */
export async function generateIntervention(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { procrastinationType, taskTitle } = req.body

    if (!procrastinationType || typeof procrastinationType !== 'string') {
      error(res, '请提供有效的拖延类型（procrastinationType）', 400)
      return
    }

    logger.info(`生成干预方案: userId=${userId}, type=${procrastinationType}`)

    const suggestion = await interventionService.generateIntervention(userId, {
      procrastinationType,
      taskTitle,
      userId,
    })

    success(res, suggestion, '干预方案生成成功', 201)
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    if (e.statusCode === 400) {
      error(res, e.message, 400)
      return
    }
    next(err)
  }
}

/**
 * GET /api/intervention/strategy/:type
 * 获取指定类型的预设策略（不调 LLM，即时返回）
 */
export async function getPresetStrategy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const type = req.params.type
    const result = interventionService.getPresetStrategy(type)
    success(res, result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/intervention/strategies
 * 获取所有 5 种类型的策略摘要
 */
export async function getAllStrategies(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const strategies = interventionService.getAllStrategies()
    success(res, strategies, `共 ${strategies.length} 种策略`)
  } catch (err) {
    next(err)
  }
}
