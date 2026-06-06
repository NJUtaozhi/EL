/**
 * 用户路由
 * POST /login  - 登录/注册（微信小程序 openId 模式）
 * GET  /me     - 获取当前用户信息（需认证）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import { login, getMe } from '../controllers/userController'

const router = Router()

// 登录/注册请求校验 schema
const loginSchema = z.object({
  openId: z.string().min(1, 'openId 不能为空'),
  nickname: z.string().optional(),
  avatar: z.string().optional(),
})

router.post('/login', validate(loginSchema), login)
router.get('/me', auth, getMe)

export default router
