/**
 * 用户业务逻辑
 * 处理登录/注册、用户信息查询
 */
import prisma from '../config/database'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import type { LoginDTO, UserInfo, UserWithToken } from '../models/User'

/**
 * 登录（openId 模式）：用户存在则更新信息，不存在则创建
 */
export async function login(dto: LoginDTO): Promise<UserWithToken> {
  let user = await prisma.user.findUnique({
    where: { openId: dto.openId },
  })

  if (user) {
    // 已存在用户：更新昵称和头像
    user = await prisma.user.update({
      where: { openId: dto.openId },
      data: {
        nickname: dto.nickname ?? user.nickname,
        avatar: dto.avatar ?? user.avatar,
      },
    })
  } else {
    // 新用户：创建
    user = await prisma.user.create({
      data: {
        openId: dto.openId,
        nickname: dto.nickname,
        avatar: dto.avatar,
      },
    })
  }

  const userInfo: UserInfo = {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    checkinStreak: user.checkinStreak,
    createdAt: user.createdAt,
  }

  // 生成 JWT token（7天有效期）
  const token = jwt.sign(
    { userId: user.id, openId: user.openId },
    config.jwt.secret,
    { expiresIn: 604800 }, // 7 days in seconds
  )

  return { user: userInfo, token }
}

/**
 * 更新用户昵称
 */
export async function updateNickname(userId: number, nickname: string): Promise<UserInfo> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { nickname },
  })

  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    checkinStreak: user.checkinStreak,
    createdAt: user.createdAt,
  }
}

/**
 * 根据 ID 获取用户信息
 */
export async function getUserById(userId: number): Promise<UserInfo | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return null

  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    checkinStreak: user.checkinStreak,
    createdAt: user.createdAt,
  }
}
