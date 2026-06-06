import { useState, useEffect, useCallback } from 'react'
import { getDashboard, type DashboardData } from '@/api/dashboard'
import { useUserStore } from '@/store/userStore'
import WeeklyReport from './components/WeeklyReport'
import ProfileHeatMap from './components/HeatMap'
import ProfileTrendCurve from './components/TrendCurve'
import styles from './style.module.css'

/** 模拟热力图数据（横轴时段 × 纵轴星期 = 拖延次数） */
function generateMockHeatMap(): Array<{ day: number; period: string; value: number }> {
  const periods = ['上午', '下午', '晚上']
  const data: Array<{ day: number; period: string; value: number }> = []
  for (let day = 0; day < 7; day++) {
    for (const period of periods) {
      data.push({
        day,
        period,
        value: Math.floor(Math.random() * 5),
      })
    }
  }
  return data
}

export default function ProfilePage() {
  const { user } = useUserStore()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [heatMapData] = useState(() => generateMockHeatMap())

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const data = await getDashboard()
      setDashboard(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <div className={`page-container ${styles.profile}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>👤 拖延画像</h2>
        <p className={styles.pageDesc}>了解你的拖延模式，看清自己的成长</p>
      </div>

      {/* 用户信息卡片 */}
      <div className={`card ${styles.userCard}`}>
        <div className={styles.avatar}>😊</div>
        <div className={styles.userInfo}>
          <h3 className={styles.userName}>{user?.nickname || '拖延探索者'}</h3>
          <p className={styles.userLevel}>
            连续打卡 {dashboard?.streak ?? 0} 天 · 总计 {dashboard?.totalCheckins ?? 0} 次
          </p>
        </div>
      </div>

      {/* 加载/错误 */}
      {loading && (
        <div className={`card ${styles.stateCard}`}>
          <p className={styles.stateText}>加载数据中...</p>
        </div>
      )}
      {error && (
        <div className={`card ${styles.stateCard}`}>
          <p className={styles.stateText}>数据加载失败</p>
          <button className={styles.retryBtn} onClick={fetchDashboard}>
            重试
          </button>
        </div>
      )}

      {/* 仪表盘数据展示 */}
      {dashboard && !loading && (
        <div className={styles.sections}>
          {/* 周报告 + 饼图 */}
          <div className={styles.section}>
            <WeeklyReport dashboard={dashboard} />
          </div>

          {/* 趋势曲线 */}
          <div className={styles.section}>
            <ProfileTrendCurve
              taskData={dashboard.weekDailyTaskCounts}
              checkinData={dashboard.weekDailyCheckinCounts}
            />
          </div>

          {/* 热力图 */}
          <div className={styles.section}>
            <ProfileHeatMap data={heatMapData} />
            <p className={styles.heatmapHint}>
              ⚠️ 热力图当前为模拟数据，后续版本将接入真实数据
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
