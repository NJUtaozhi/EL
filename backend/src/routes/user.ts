/**
 * 用户路由
 * POST /login       - 登录/注册（微信小程序 openId 模式）
 * GET  /me          - 获取当前用户信息（需认证）
 * PUT  /me          - 更新昵称（需认证）
 * POST /avatar      - 上传头像（需认证，multipart/form-data）
 */
import { Router } from 'express'
import { auth } from '../middleware/auth'
import { validate } from '../middleware/validator'
import { z } from 'zod'
import { login, getMe, updateMe, uploadAvatar } from '../controllers/userController'
import { upload } from '../config/upload'

const router = Router()

// 登录/注册请求校验 schema
const loginSchema = z.object({
  openId: z.string().min(1, 'openId 不能为空'),
  nickname: z.string().optional(),
  avatar: z.string().optional(),
})

// 更新昵称校验
const updateMeSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最长20字'),
})

router.post('/login', validate(loginSchema), login)
router.get('/me', auth, getMe)
router.put('/me', auth, validate(updateMeSchema), updateMe)
router.post('/avatar', auth, upload.single('file'), uploadAvatar)

export default router
