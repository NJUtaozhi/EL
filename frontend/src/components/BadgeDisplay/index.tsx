import type { Badge } from '@/types/user'
import styles from './index.module.css'

interface BadgeDisplayProps {
  badge: Badge
  earned?: boolean
}

/** 徽章 → emoji 映射 */
const BADGE_EMOJI: Record<string, string> = {
  '首次打卡': '🎯',
  '连续7天': '🔥',
  '连续30天': '👑',
  '纪录达人': '📋',
  '归因大师': '🧠',
  '行动先锋': '⚡',
  '完美一周': '💎',
}

/**
 * 徽章图标展示
 */
export default function BadgeDisplay({ badge, earned = false }: BadgeDisplayProps) {
  const emoji = BADGE_EMOJI[badge.name] || '🏅'

  return (
    <div className={`${styles.badge} ${earned ? styles.earned : styles.locked}`}>
      <div className={styles.iconWrap}>
        <span className={styles.emoji}>{emoji}</span>
        {earned && <span className={styles.glow} />}
      </div>
      <span className={styles.name}>{badge.name}</span>
      {earned ? (
        <span className={styles.date}>
          {new Date(badge.earnedAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ) : (
        <span className={styles.hint}>未解锁</span>
      )}
    </div>
  )
}
