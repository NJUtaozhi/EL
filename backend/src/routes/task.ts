/**
 * 任务路由
 * POST   /           - 创建任务（需认证）
 * GET    /           - 查询任务列表（需认证）
 * GET    /:id        - 查询单个任务详情（需认证）
 * DELETE /:id        - 删除任务（需认证）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
} from '../controllers/taskController'

const router = Router()

// 创建任务请求校验
const createTaskSchema = z.object({
  title: z.string().min(1, '任务名不能为空').max(200, '任务名最长200字'),
  reason: z.string().max(500, '理由最长500字').optional(),
  emotion: z.enum(['开心', '焦虑', '平静', '沮丧', '生气']).optional(),
})

// 所有 task 路由都需要认证
router.use(auth)

router.post('/', validate(createTaskSchema), createTask)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.delete('/:id', deleteTask)

export default router
