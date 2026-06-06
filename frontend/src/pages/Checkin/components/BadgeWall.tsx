import { useEffect, useState } from 'react'
import { getBadges } from '@/api/checkin'
import type { Badge } from '@/types/user'
import BadgeDisplay from '@/components/BadgeDisplay'

/** 预设全部徽章池 */
const ALL_BADGES: Badge[] = [
  { id: 0, name: '首次打卡', icon: '🎯', condition: '完成第一次打卡', earnedAt: '' },
  { id: 1, name: '连续7天', icon: '🔥', condition: '连续打卡7天', earnedAt: '' },
  { id: 2, name: '连续30天', icon: '👑', condition: '连续打卡30天', earnedAt: '' },
  { id: 3, name: '纪录达人', icon: '📋', condition: '记录10个拖-延事件', earnedAt: '' },
  { id: 4, name: '归因大师', icon: '🧠', condition: '完成5次归因分析', earnedAt: '' },
  { id: 5, name: '行动先锋', icon: '⚡', condition: '完成3个干预计划', earnedAt: '' },
  { id: 6, name: '完美一周', icon: '💎', condition: '一周7天全部打卡', earnedAt: '' },
]

/**
 * 虚拟徽章墙 ⚪ 可选
 */
export default function BadgeWall() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([])

  useEffect(() => {
    getBadges()
      .then(setEarnedBadges)
      .catch(() => {})
  }, [])

  const earnedIds = new Set(earnedBadges.map((b) => b.name))

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
          {earnedBadges.length}/{ALL_BADGES.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {ALL_BADGES.map((badge) => (
          <BadgeDisplay
            key={badge.id}
            badge={badge}
            earned={earnedIds.has(badge.name)}
          />
        ))}
      </div>
    </div>
  )
}
