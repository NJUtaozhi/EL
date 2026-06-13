import { useState, useEffect } from 'react'
import type { Badge } from '@/types/user'
import styles from './index.module.css'

interface BadgeToastProps {
  badges: Badge[]
  onDismiss: () => void
}

/**
 * 徽章获得庆祝通知
 * - 全屏半透明遮罩 + 居中弹出卡片
 * - 多枚徽章逐一展示，每枚约 2.5 秒
 * - 全部展示完毕后自动 dismiss
 */
export default function BadgeToast({ badges, onDismiss }: BadgeToastProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (badges.length === 0) {
      onDismiss()
      return
    }
    // 每枚徽章展示 2.5 秒后切换到下一枚或消失
    const timer = setTimeout(() => {
      if (index < badges.length - 1) {
        setIndex((i) => i + 1)
      } else {
        onDismiss()
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [index, badges.length, onDismiss])

  if (badges.length === 0) return null

  const badge = badges[index]
  if (!badge) return null

  return (
    <div className={styles.overlay} onClick={onDismiss}>
      <div className={styles.toast} onClick={(e) => e.stopPropagation()}>
        <span className={styles.badgeIcon}>{badge.icon || '🏅'}</span>
        <div className={styles.badgeName}>{badge.name}</div>
        <div className={styles.badgeLabel}>新徽章已解锁！</div>
        {badges.length > 1 && (
          <div className={styles.counter}>
            {index + 1} / {badges.length}
          </div>
        )}
      </div>
    </div>
  )
}
