import { useEffect, useState, useCallback } from 'react'
import { getBadgeRules } from '@/api/checkin'
import type { BadgeRule } from '@/types/user'
import BadgeDisplay from '@/components/BadgeDisplay'

interface BadgeWallProps {
  /** 外部触发刷新（如获得新徽章后） */
  refreshKey?: number
}

/**
 * 徽章墙 — 展示全部 7 枚预设徽章
 * 数据来自后端 /badge-rules，每枚含 earned 状态 + 解锁进度
 */
export default function BadgeWall({ refreshKey = 0 }: BadgeWallProps) {
  const [rules, setRules] = useState<BadgeRule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRules = useCallback(() => {
    setLoading(true)
    getBadgeRules()
      .then(setRules)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules, refreshKey])

  const earnedCount = rules.filter((r) => r.earned).length
  const totalCount = rules.length

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <h4 style={{ fontSize: 14, fontWeight: 600 }}>🏆 徽章墙</h4>
        <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
          {earnedCount}/{totalCount}
        </span>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-light)', fontSize: 13 }}>
          加载中...
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {rules.map((rule, i) => (
            <BadgeDisplay
              key={i}
              badge={rule}
              earned={rule.earned}
              progress={rule.progress}
            />
          ))}
        </div>
      )}
    </div>
  )
}
