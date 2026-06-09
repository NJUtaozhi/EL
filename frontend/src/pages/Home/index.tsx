import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardOverview, type DashboardData } from '@/api/dashboard'
import { useCheckin } from '@/hooks/useCheckin'
import { useCheckinStore } from '@/store/checkinStore'
import styles from './style.module.css'

/** 拖延类型 → 展示配置 */
const TYPE_EMOJI: Record<string, string> = {
  '畏难型': '🏔️',
  '焦虑型': '😰',
  '贪玩型': '🎮',
  '无规划型': '🗺️',
  '完美主义型': '✨',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { streak, todayCheckedIn, loading: checkinLoading, checkin } = useCheckin()
  const { setStreak, setTodayCheckedIn } = useCheckinStore()

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getDashboardOverview()
      setDashboard(data)
      // 将后端返回的真实 streak 和 todayCheckedIn 同步到打卡 store
      setStreak(data.streak)
      setTodayCheckedIn(data.todayCheckedIn)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [setStreak, setTodayCheckedIn])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const handleCheckin = async () => {
    try {
      await checkin('完成一项拖延任务')
    } catch {
      // 静默失败
    }
  }

  const recentType = dashboard?.recentProcrastinationType

  return (
    <div className={`page-container ${styles.home}`}>
      {/* 欢迎卡片 */}
      <div className={`${styles.welcomeCard} healing-gradient`}>
        <h2 className={styles.greeting}>
          {todayCheckedIn ? '👏 今天已打卡' : '👋 欢迎回来'}
        </h2>
        <p className={styles.subtitle}>
          {todayCheckedIn ? '太棒了！继续保持' : '今天也要加油，不让拖延靠近你'}
        </p>
      </div>

      {/* 数据概览 */}
      <div className={styles.statsRow}>
        <div className={`card ${styles.statCard}`}>
          {loading ? (
            <span className={styles.statLoading}>--</span>
          ) : (
            <span className={styles.statNumber}>{dashboard?.todayTaskCount ?? '--'}</span>
          )}
          <span className={styles.statLabel}>今日任务</span>
        </div>
        <div className={`card ${styles.statCard}`}>
          {loading ? (
            <span className={styles.statLoading}>--</span>
          ) : (
            <span className={styles.statNumber}>{streak}</span>
          )}
          <span className={styles.statLabel}>连续打卡</span>
        </div>
        <div className={`card ${styles.statCard}`}>
          {loading ? (
            <span className={styles.statLoading}>--</span>
          ) : (
            <span className={styles.statNumber}>{dashboard?.totalTasks ?? '--'}</span>
          )}
          <span className={styles.statLabel}>总记录</span>
        </div>
      </div>

      {/* 最近拖延类型 */}
      {recentType && !loading && (
        <div className={`card ${styles.recentType}`}>
          <span className={styles.recentIcon}>{TYPE_EMOJI[recentType] || '❓'}</span>
          <div className={styles.recentInfo}>
            <span className={styles.recentLabel}>最近拖延类型</span>
            <span className={styles.recentValue}>{recentType}</span>
          </div>
        </div>
      )}

      {/* 新用户引导：还没有数据时显示 */}
      {!loading && !error && !recentType && dashboard && (
        <div className={`card ${styles.stateCard}`}>
          <span style={{ fontSize: 32 }}>🚀</span>
          <p className={styles.stateText}>准备开始你的不拖延之旅</p>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
            先去「记录拖延」写下第一条记录吧
          </p>
        </div>
      )}

      {/* 加载/错误 */}
      {loading && !dashboard && (
        <div className={`card ${styles.stateCard}`}>
          <p className={styles.stateText}>加载中...</p>
        </div>
      )}
      {error && (
        <div className={`card ${styles.stateCard}`}>
          <p className={styles.stateText}>加载失败</p>
          <button className={styles.retryBtn} onClick={fetchDashboard}>
            重试
          </button>
        </div>
      )}

      {/* 每日打卡 */}
      <div className={`card ${styles.checkinCard}`}>
        <div className={styles.checkinInfo}>
          <span className={styles.checkinIcon}>✅</span>
          <div>
            <p className={styles.checkinTitle}>每日微行动</p>
            <p className={styles.checkinHint}>
              {todayCheckedIn ? '今日已打卡 ✨' : '点击打卡，坚持就是胜利'}
            </p>
          </div>
        </div>
        <button
          className={`${styles.checkinBtn} ${todayCheckedIn ? styles.checkinBtnDone : ''}`}
          onClick={handleCheckin}
          disabled={todayCheckedIn || checkinLoading}
        >
          {checkinLoading ? '...' : todayCheckedIn ? '已打卡' : '打卡'}
        </button>
      </div>

      {/* 快捷入口 */}
      <div className={styles.quickActions}>
        <button className={`card ${styles.actionBtn}`} onClick={() => navigate('/log')}>
          <span className={styles.actionIcon}>📝</span>
          <span className={styles.actionLabel}>记录拖延</span>
        </button>
        <button className={`card ${styles.actionBtn}`} onClick={() => navigate('/analysis')}>
          <span className={styles.actionIcon}>🔍</span>
          <span className={styles.actionLabel}>查看分析</span>
        </button>
        <button className={`card ${styles.actionBtn}`} onClick={() => navigate('/intervention')}>
          <span className={styles.actionIcon}>💡</span>
          <span className={styles.actionLabel}>干预建议</span>
        </button>
      </div>
    </div>
  )
}
