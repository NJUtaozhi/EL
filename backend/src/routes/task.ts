/**
 * 任务路由（第2周完整实现）
 * 占位路由，确保路由 index.ts 能正常导入
 */
import { Router } from 'express'

const router = Router()

// TODO: 第2周实现 task CRUD 路由
router.get('/', (_req, res) => {
  res.json({ code: 0, data: [], message: 'ok' })
})

export default router
