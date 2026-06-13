import type { Badge, BadgeProgress } from '@/types/user'
import styles from './index.module.css'

interface BadgeDisplayProps {
  badge: Badge | { name: string; icon: string; condition: string; earnedAt?: string }
  earned?: boolean
  progress?: BadgeProgress
}

/**
 * 徽章图标展示
 * - earned: 金色发光 + 获得日期
 * - locked: 灰度 + 进度 / 条件文字
 */
export default function BadgeDisplay({ badge, earned = false, progress }: BadgeDisplayProps) {
  const emoji = badge.icon || '🏅'

  return (
    <div className={`${styles.badge} ${earned ? styles.earned : styles.locked}`}>
      <div className={styles.iconWrap}>
        <span className={styles.emoji}>{emoji}</span>
        {earned && <span className={styles.glow} />}
      </div>
      <span className={styles.name}>{badge.name}</span>
      {earned ? (
        badge.earnedAt ? (
          <span className={styles.date}>
            {new Date(badge.earnedAt).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        ) : null
      ) : (
        <>
          {progress ? (
            <span className={styles.progress}>
              {progress.current}/{progress.target}
            </span>
          ) : (
            <span className={styles.hint}>未解锁</span>
          )}
          <span className={styles.condition}>{badge.condition}</span>
        </>
      )}
    </div>
  )
}
