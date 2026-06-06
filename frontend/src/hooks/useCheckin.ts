import { useState, useCallback } from 'react'
import { useCheckinStore } from '@/store/checkinStore'
import { doCheckin, getCheckinStreak } from '@/api/checkin'

/**
 * 打卡状态 Hook
 * 管理打卡操作和连续天数
 */
export function useCheckin() {
  const { streak, todayCheckedIn, setStreak, setTodayCheckedIn } =
    useCheckinStore()
  const [loading, setLoading] = useState(false)

  /** 加载连续打卡天数 */
  const fetchStreak = useCallback(async () => {
    try {
      const s = await getCheckinStreak()
      setStreak(s)
    } catch {
      // 静默失败
    }
  }, [setStreak])

  /** 执行打卡 */
  const checkin = useCallback(
    async (action: string) => {
      setLoading(true)
      try {
        await doCheckin(action)
        setTodayCheckedIn(true)
        setStreak(streak + 1)
      } catch {
        throw new Error('打卡失败')
      } finally {
        setLoading(false)
      }
    },
    [streak, setStreak, setTodayCheckedIn]
  )

  return {
    streak,
    todayCheckedIn,
    loading,
    checkin,
    fetchStreak,
  }
}
