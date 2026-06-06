/**
 * 归因分析路由（第3周完整实现）
 *
 * POST   /api/analysis/submit       - 提交任务进行归因分析（需认证）
 * GET    /api/analysis/result/:taskId - 获取指定任务的分析结果（需认证）
 * GET    /api/analysis/history       - 获取用户分析历史列表（需认证）
 * GET    /api/analysis/distribution  - 获取用户拖延类型分布统计（需认证）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import {
  submitAnalysis,
  getAnalysisResult,
  getHistory,
  getDistribution,
} from '../controllers/analysisController'

const router = Router()

// 所有分析路由都需要认证
router.use(auth)

// 提交分析请求校验
const submitSchema = z.object({
  taskId: z.number().int().positive('taskId 必须为正整数'),
  forceRefresh: z.boolean().optional(),
})

router.post('/submit', validate(submitSchema), submitAnalysis)
router.get('/result/:taskId', getAnalysisResult)
router.get('/history', getHistory)
router.get('/distribution', getDistribution)

export default router
