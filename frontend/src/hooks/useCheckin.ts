import { useState, useEffect, useCallback } from 'react'
import { useCheckinStore } from '@/store/checkinStore'
import { doCheckin, getCheckinStatus } from '@/api/checkin'
import type { Badge } from '@/types/user'

/**
 * 打卡状态 Hook
 * 管理打卡操作和连续天数
 * - 自动加载后端真实连续天数
 * - 打卡后使用后端返回的实际 streak
 * - 返回新获得的徽章列表供调用方展示通知
 */
export function useCheckin() {
  const { streak, todayCheckedIn, setStreak, setTodayCheckedIn } =
    useCheckinStore()
  const [loading, setLoading] = useState(false)

  /** 加载打卡状态（streak + todayCheckedIn） */
  const fetchStatus = useCallback(async () => {
    try {
      const status = await getCheckinStatus()
      setStreak(status.streak)
      setTodayCheckedIn(status.todayCheckedIn)
    } catch {
      // 静默失败
    }
  }, [setStreak, setTodayCheckedIn])

  /** 组件挂载时自动加载打卡状态 */
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  /** 执行打卡，返回新获得的徽章（如果有） */
  const checkin = useCallback(
    async (action: string): Promise<Badge[]> => {
      setLoading(true)
      try {
        const result = await doCheckin(action)
        setTodayCheckedIn(true)
        // 使用后端返回的真实连续天数，而非前端 +1
        setStreak(result.streak)
        return result.newBadges || []
      } catch {
        throw new Error('打卡失败')
      } finally {
        setLoading(false)
      }
    },
    [setStreak, setTodayCheckedIn]
  )

  return {
    streak,
    todayCheckedIn,
    loading,
    checkin,
    fetchStatus,
  }
}
