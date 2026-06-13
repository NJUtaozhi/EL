/**
 * 用户控制器
 * 处理用户登录和获取用户信息的 HTTP 请求
 */
import { Request, Response, NextFunction } from 'express'
import * as userService from '../services/userService'
import { success, error } from '../utils/response'
import logger from '../utils/logger'

/**
 * POST /api/user/login
 * 微信小程序登录：openId 登录即注册
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { openId, nickname, avatar } = req.body

    logger.info(`用户登录: openId=${openId.slice(0, 8)}...`)

    const result = await userService.login({ openId, nickname, avatar })

    success(res, result, '登录成功')
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /api/user/me
 * 更新当前用户昵称
 */
export async function updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { nickname } = req.body

    const user = await userService.updateNickname(userId, nickname)
    success(res, user, '昵称已更新')
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/user/avatar
 * 上传用户头像
 */
export async function uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const file = req.file

    if (!file) {
      error(res, '请选择要上传的图片', 400)
      return
    }

    // 构造公开访问 URL
    const avatarUrl = `/uploads/${file.filename}`
    const user = await userService.updateAvatar(userId, avatarUrl)

    logger.info(`用户 ${userId} 更新头像: ${avatarUrl}`)
    success(res, user, '头像已更新')
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/user/me
 * 获取当前登录用户信息
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const user = await userService.getUserById(userId)

    if (!user) {
      error(res, '用户不存在', 404, 404)
      return
    }

    success(res, user)
  } catch (err) {
    next(err)
  }
}
