/**
 * 打卡路由（第4周完整实现）
 *
 * POST   /api/checkin           - 执行每日打卡（需认证）
 * GET    /api/checkin/history    - 获取打卡历史（需认证，可选 month 参数）
 * GET    /api/checkin/streak     - 获取连续打卡天数（需认证）
 * GET    /api/checkin/badges     - 获取徽章列表（需认证）
 * GET    /api/checkin/status     - 获取打卡状态概览（需认证）
 * GET    /api/checkin/calendar   - 获取打卡日历数据（需认证，year/month 必填）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import {
  doCheckin,
  getHistory,
  getStreak,
  getBadges,
  getStatus,
  getCalendar,
} from '../controllers/checkinController'

const router = Router()

// 所有打卡路由都需要认证
router.use(auth)

// 打卡请求校验
const checkinSchema = z.object({
  action: z.string().min(1, '打卡内容不能为空').max(200, '打卡内容最长200字'),
})

router.post('/', validate(checkinSchema), doCheckin)
router.get('/history', getHistory)
router.get('/streak', getStreak)
router.get('/badges', getBadges)
router.get('/status', getStatus)
router.get('/calendar', getCalendar)

export default router
