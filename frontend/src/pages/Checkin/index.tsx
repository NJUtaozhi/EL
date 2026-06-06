import { useState, useCallback, useEffect } from 'react'
import { useCheckin } from '@/hooks/useCheckin'
import { getCheckinHistory } from '@/api/checkin'
import { useCheckinStore } from '@/store/checkinStore'
import CheckinButton from '@/components/CheckinButton'
import MicroAction, { ACTION_POOL } from './components/MicroAction'
import CheckinCalendar from './components/CheckinCalendar'
import BadgeWall from './components/BadgeWall'

export default function CheckinPage() {
  const { streak, todayCheckedIn, loading, checkin } = useCheckin()
  const { setTodayCheckedIn, setStreak } = useCheckinStore()

  const [action, setAction] = useState(ACTION_POOL[0])
  const [checkedDates, setCheckedDates] = useState<Set<string>>(new Set())

  // 加载打卡历史
  useEffect(() => {
    getCheckinHistory()
      .then((history) => {
        const dates = new Set(history.map((r) => r.date?.slice(0, 10)))
        setCheckedDates(dates)
        // 检查今天是否已打卡
        const today = new Date().toISOString().slice(0, 10)
        if (dates.has(today)) setTodayCheckedIn(true)
      })
      .catch(() => {})
  }, [setTodayCheckedIn])

  // 随机换一个微行动
  const refreshAction = useCallback(() => {
    let newAction: string
    do {
      newAction = ACTION_POOL[Math.floor(Math.random() * ACTION_POOL.length)]
    } while (newAction === action && ACTION_POOL.length > 1)
    setAction(newAction)
  }, [action])

  // 执行打卡
  const handleCheckin = async () => {
    try {
      await checkin(action)
      const today = new Date().toISOString().slice(0, 10)
      setCheckedDates((prev) => new Set(prev).add(today))
    } catch {
      // 静默
    }
  }

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>✅ 每日打卡</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          坚持微行动 · 连续 {streak} 天
        </p>
      </div>

      {/* 最小行动卡片 */}
      <MicroAction action={action} onRefresh={refreshAction} />

      {/* 打卡按钮 */}
      <div style={{ marginBottom: 24 }}>
        <CheckinButton
          onClick={handleCheckin}
          checkedIn={todayCheckedIn}
          loading={loading}
        />
      </div>

      {/* 打卡月历 */}
      {checkedDates.size > 0 && (
        <div style={{ marginBottom: 16 }}>
          <CheckinCalendar checkedDates={checkedDates} />
        </div>
      )}

      {/* 徽章墙 */}
      <div style={{ marginBottom: 16 }}>
        <BadgeWall />
      </div>
    </div>
  )
}
