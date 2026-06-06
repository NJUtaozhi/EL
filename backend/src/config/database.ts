/**
 * Prisma Client 单例
 * 全局共享同一个数据库连接实例
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma
