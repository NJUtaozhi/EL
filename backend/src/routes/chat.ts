/**
 * AI 对话路由（⏸️ 暂缓，专项组实现）
 * 占位路由，确保路由 index.ts 能正常导入
 */
import { Router } from 'express'

const router = Router()

// ⏸️ 暂缓：专项组再实现 AI 对话功能
router.get('/', (_req, res) => {
  res.json({ code: 0, data: { status: '暂缓' }, message: '该功能将在专项组阶段实现' })
})

export default router
