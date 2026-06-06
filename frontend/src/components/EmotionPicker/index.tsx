import type { Emotion } from '@/types/task'
import { EMOTION_LIST } from '@/hooks/useEmotion'
import styles from './index.module.css'

interface EmotionPickerProps {
  value?: Emotion
  onChange: (emotion: Emotion) => void
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 情绪选择器
 * 5种心情图标网格：开心/焦虑/平静/沮丧/生气
 */
export default function EmotionPicker({
  value,
  onChange,
  disabled = false,
}: EmotionPickerProps) {
  return (
    <div className={styles.picker}>
      <span className={styles.label}>😌 此刻心情</span>
      <div className={styles.grid}>
        {EMOTION_LIST.map(({ key, emoji, label }) => {
          const selected = value === key
          return (
            <button
              key={key}
              type="button"
              className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
              onClick={() => onChange(key)}
              disabled={disabled}
              aria-label={label}
            >
              <span className={styles.emoji}>{emoji}</span>
              <span className={`${styles.itemLabel} ${selected ? styles.itemLabelSelected : ''}`}>
                {label}
              </span>
              {selected && <div className={styles.dot} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
