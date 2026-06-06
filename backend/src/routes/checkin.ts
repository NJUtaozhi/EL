/**
 * 打卡路由（第4周完整实现）
 * 占位路由，确保路由 index.ts 能正常导入
 */
import { Router } from 'express'

const router = Router()

// TODO: 第4周实现打卡路由
router.get('/', (_req, res) => {
  res.json({ code: 0, data: [], message: 'ok' })
})

export default router
