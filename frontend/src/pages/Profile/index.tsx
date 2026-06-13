import { useState, useEffect, useCallback, useRef } from 'react'
import { getDashboard, type DashboardData } from '@/api/dashboard'
import { updateNickname } from '@/api/user'
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
  const { user, setUser } = useUserStore()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [heatMapData] = useState(() => generateMockHeatMap())

  // 昵称编辑
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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

  const startEdit = () => {
    setEditName(user?.nickname || '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const saveNickname = async () => {
    const name = editName.trim()
    if (!name) {
      setEditing(false)
      return
    }
    if (name === user?.nickname) {
      setEditing(false)
      return
    }
    setSaving(true)
    setSaveError('')
    try {
      const updated = await updateNickname(name)
      setUser(updated)
      setEditing(false)
    } catch (err: any) {
      // 失败保留编辑状态，显示错误提示
      setSaveError(err?.message || '保存失败，请检查网络后重试')
      inputRef.current?.focus()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveNickname()
    if (e.key === 'Escape') setEditing(false)
  }

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
          {editing ? (
            <div className={styles.editWrap}>
              <input
                ref={inputRef}
                className={styles.nicknameInput}
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setSaveError('') }}
                onBlur={saveNickname}
                onKeyDown={handleKeyDown}
                maxLength={20}
                disabled={saving}
              />
              {saving && <span className={styles.saveHint}>保存中...</span>}
              {saveError && <span className={styles.saveError}>{saveError}</span>}
            </div>
          ) : (
            <h3 className={styles.userName} onClick={startEdit} title="点击修改昵称">
              {user?.nickname || '拖延探索者'}
              <span className={styles.editHint}> ✎</span>
            </h3>
          )}
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
            {dashboard.totalTasks > 0 ? (
              <WeeklyReport dashboard={dashboard} />
            ) : (
              <div className={`card ${styles.stateCard}`}>
                <span className={styles.emptyIcon}>📊</span>
                <p className={styles.stateText}>还没有拖延数据</p>
                <p className={styles.emptyHint}>记录几条拖延后再来看看你的拖延画像</p>
              </div>
            )}
          </div>

          {/* 趋势曲线 */}
          <div className={styles.section}>
            {dashboard.totalTasks > 0 ? (
              <ProfileTrendCurve
                taskData={dashboard.weekDailyTaskCounts}
                checkinData={dashboard.weekDailyCheckinCounts}
              />
            ) : (
              <div className={`card ${styles.stateCard}`}>
                <span className={styles.emptyIcon}>📈</span>
                <p className={styles.stateText}>趋势图需要更多数据</p>
                <p className={styles.emptyHint}>坚持记录一周后，这里会出现你的拖延趋势</p>
              </div>
            )}
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
