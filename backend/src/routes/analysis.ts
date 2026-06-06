/**
 * 归因分析路由（第3周完整实现）
 * 占位路由，确保路由 index.ts 能正常导入
 */
import { Router } from 'express'

const router = Router()

// TODO: 第3周实现分析路由
router.get('/', (_req, res) => {
  res.json({ code: 0, data: [], message: 'ok' })
})

export default router
