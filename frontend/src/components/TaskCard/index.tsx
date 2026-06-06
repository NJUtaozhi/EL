import { DeleteIcon } from 'tdesign-icons-react'
import type { Task } from '@/types/task'
import { EMOTION_LIST } from '@/hooks/useEmotion'
import { fromNow } from '@/utils/format'
import styles from './index.module.css'

interface TaskCardProps {
  task: Task
  onDelete?: (id: number) => void
  onClick?: (task: Task) => void
}

/**
 * 任务卡片
 * 展示：标题 + 拖延理由摘要 + 情绪标签 + 相对时间
 */
export default function TaskCard({ task, onDelete, onClick }: TaskCardProps) {
  const emotionItem = task.emotion
    ? EMOTION_LIST.find((e) => e.key === task.emotion)
    : null

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && confirm('确定要删除这条记录吗？')) {
      onDelete(task.id)
    }
  }

  return (
    <div className={`card ${styles.card}`} onClick={() => onClick?.(task)}>
      <div className={styles.body}>
        {/* 标题行 */}
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{task.title}</h3>
          <span className={styles.time}>{fromNow(task.createdAt)}</span>
        </div>

        {/* 拖延理由 */}
        {task.reason && (
          <p className={styles.reason}>
            💬 {task.reason}
          </p>
        )}

        {/* 底部标签行 */}
        <div className={styles.tags}>
          {emotionItem && (
            <span className={styles.emotionTag}>
              {emotionItem.emoji} {emotionItem.label}
            </span>
          )}
          {task.semesterPhase && (
            <span className={styles.phaseTag}>
              📅 {task.semesterPhase}
            </span>
          )}
        </div>
      </div>

      {/* 删除按钮 */}
      {onDelete && (
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          aria-label="删除任务"
        >
          <DeleteIcon size="16px" />
        </button>
      )}
    </div>
  )
}
