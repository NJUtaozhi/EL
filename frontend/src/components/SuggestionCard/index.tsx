import { useState } from 'react'
import { StarIcon, StarFilledIcon, ChevronDownIcon } from 'tdesign-icons-react'
import type { Suggestion } from '@/api/intervention'
import styles from './index.module.css'

interface SuggestionCardProps {
  suggestion: Suggestion
  onFavorite?: (id: number) => void
  isFavorited?: boolean
}

/** 拖延类型 → emoji */
const TYPE_EMOJI: Record<string, string> = {
  '畏难型': '🏔️',
  '焦虑型': '😰',
  '贪玩型': '🎮',
  '无规划型': '🗺️',
  '完美主义型': '✨',
}

/**
 * 干预建议卡片
 * 标题 + 策略 + 步骤 + 鼓励语 + 收藏按钮
 */
export default function SuggestionCard({
  suggestion,
  onFavorite,
  isFavorited = false,
}: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`card ${styles.card}`}>
      {/* 头部：类型图标 + 标题 */}
      <div className={styles.header}>
        <span className={styles.typeIcon}>
          {TYPE_EMOJI[suggestion.type] || '💡'}
        </span>
        <div className={styles.headerInfo}>
          <h4 className={styles.title}>{suggestion.title}</h4>
          <span className={styles.strategy}>策略：{suggestion.strategy}</span>
        </div>
        {onFavorite && (
          <button
            className={`${styles.favBtn} ${isFavorited ? styles.favBtnActive : ''}`}
            onClick={() => onFavorite(suggestion.id)}
            aria-label={isFavorited ? '取消收藏' : '收藏'}
          >
            {isFavorited ? (
              <StarFilledIcon size="18px" />
            ) : (
              <StarIcon size="18px" />
            )}
          </button>
        )}
      </div>

      {/* 建议步骤 */}
      {suggestion.steps.length > 0 && (
        <div className={styles.steps}>
          {suggestion.steps.slice(0, expanded ? suggestion.steps.length : 2).map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>
      )}

      {/* 展开更多 */}
      {suggestion.steps.length > 2 && (
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起' : `展开全部 (${suggestion.steps.length}步)`}
          <ChevronDownIcon
            size="14px"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      )}

      {/* 鼓励语 */}
      {suggestion.encouragement && (
        <div className={styles.encouragement}>
          <span className={styles.encourageIcon}>🌟</span>
          <p className={styles.encourageText}>{suggestion.encouragement}</p>
        </div>
      )}

      {/* 小贴士 */}
      {suggestion.tip && (
        <div className={styles.tip}>
          <span className={styles.tipLabel}>💬 小贴士</span>
          <p className={styles.tipText}>{suggestion.tip}</p>
        </div>
      )}
    </div>
  )
}
