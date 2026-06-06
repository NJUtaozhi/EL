/**
 * 路由汇总
 * 将所有子路由挂载到统一前缀下
 */
import { Router } from 'express'
import taskRoutes from './task'
import analysisRoutes from './analysis'
import userRoutes from './user'
import checkinRoutes from './checkin'
import dashboardRoutes from './dashboard'
import chatRoutes from './chat'

const router = Router()

router.use('/tasks', taskRoutes)
router.use('/analysis', analysisRoutes)
router.use('/user', userRoutes)
router.use('/checkin', checkinRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/chat', chatRoutes)

export default router
