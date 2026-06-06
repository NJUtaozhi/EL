/**
 * 干预方案路由（第5周实现）
 *
 * POST   /api/intervention/generate         - 生成个性化干预方案（需认证，调 DeepSeek）
 * GET    /api/intervention/strategy/:type    - 获取指定类型预设策略（需认证）
 * GET    /api/intervention/strategies       - 获取全部5种策略摘要（需认证）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import {
  generateIntervention,
  getPresetStrategy,
  getAllStrategies,
} from '../controllers/interventionController'

const router = Router()

router.use(auth)

// 生成干预方案请求校验
const generateSchema = z.object({
  procrastinationType: z.enum(['畏难型', '焦虑型', '贪玩型', '无规划型', '完美主义型'], {
    errorMap: () => ({ message: '拖延类型必须为：畏难型、焦虑型、贪玩型、无规划型、完美主义型' }),
  }),
  taskTitle: z.string().max(200, '任务名最长200字').optional(),
})

router.post('/generate', validate(generateSchema), generateIntervention)
router.get('/strategy/:type', getPresetStrategy)
router.get('/strategies', getAllStrategies)

export default router
