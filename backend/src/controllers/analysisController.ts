/**
 * 归因分析控制器（第3周完整实现）
 * 处理分析提交和结果查询的 HTTP 请求
 */
import { Request, Response, NextFunction } from 'express'
import * as analysisService from '../services/analysisService'
import { success, error } from '../utils/response'
import logger from '../utils/logger'

/**
 * POST /api/analysis/submit
 * 提交任务进行归因分析
 * Body: { taskId: number, forceRefresh?: boolean }
 *
 * 流程：
 *   1. 校验 taskId
 *   2. 调 analysisService.analyzeTask → DeepSeek 归因
 *   3. 返回 AttributionResult
 */
export async function submitAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { taskId, forceRefresh } = req.body

    // 参数校验
    if (!taskId || typeof taskId !== 'number') {
      error(res, '请提供有效的 taskId', 400)
      return
    }

    logger.info(`提交归因分析: userId=${userId}, taskId=${taskId}, forceRefresh=${!!forceRefresh}`)

    const result = await analysisService.analyzeTask(userId, taskId, {
      forceRefresh: !!forceRefresh,
    })

    success(res, result, '归因分析完成', 201)
  } catch (err) {
    const e = err as Error & { statusCode?: number }
    if (e.statusCode === 404) {
      error(res, e.message, 404, 404)
      return
    }
    next(err)
  }
}

/**
 * GET /api/analysis/result/:taskId
 * 获取指定任务的归因分析结果（仅查数据库，不调 LLM）
 */
export async function getAnalysisResult(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const taskId = parseInt(req.params.taskId, 10)

    if (isNaN(taskId)) {
      error(res, '无效的 taskId', 400)
      return
    }

    const result = await analysisService.getAnalysisByTaskId(userId, taskId)

    if (!result) {
      error(res, '该任务尚未进行归因分析', 404, 404)
      return
    }

    success(res, result)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/analysis/history
 * 获取用户归因分析历史列表
 * Query: limit?, offset?
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0

    const results = await analysisService.getUserAnalyses(userId, { limit, offset })

    success(res, results, `共 ${results.length} 条分析记录`)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/analysis/distribution
 * 获取用户拖延类型分布统计（用于饼图）
 * 返回: { "畏难型": 5, "焦虑型": 2, ... }
 */
export async function getDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const distribution = await analysisService.getTypeDistribution(userId)

    success(res, distribution)
  } catch (err) {
    next(err)
  }
}
