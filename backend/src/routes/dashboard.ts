/**
 * 仪表盘路由（第4周实现）
 *
 * GET /api/dashboard          - 完整仪表盘数据（需认证）
 * GET /api/dashboard/overview - 首页轻量概览（需认证）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { getDashboard, getOverview } from '../controllers/dashboardController'

const router = Router()

router.use(auth)

router.get('/', getDashboard)
router.get('/overview', getOverview)

export default router
