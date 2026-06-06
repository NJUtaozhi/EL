import { useState, useCallback } from 'react'
import { AddIcon } from 'tdesign-icons-react'
import type { Emotion, CreateTaskDTO } from '@/types/task'
import EmotionPicker from '@/components/EmotionPicker'
import VoiceRecord from './VoiceRecord'
import styles from './TaskForm.module.css'

interface TaskFormProps {
  onSubmit: (data: CreateTaskDTO) => Promise<void>
  /** 是否正在提交 */
  submitting?: boolean
}

/**
 * 任务表单
 * 输入：任务名 + 拖延理由 + 情绪选择 + 语音录入
 */
export default function TaskForm({ onSubmit, submitting = false }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [reason, setReason] = useState('')
  const [emotion, setEmotion] = useState<Emotion | undefined>()
  const [showForm, setShowForm] = useState(false)

  const reset = useCallback(() => {
    setTitle('')
    setReason('')
    setEmotion(undefined)
    setShowForm(false)
  }, [])

  const handleSubmit = async () => {
    if (!title.trim()) return
    await onSubmit({
      title: title.trim(),
      reason: reason.trim() || undefined,
      emotion,
    })
    reset()
  }

  const handleVoiceResult = useCallback((text: string) => {
    setReason((prev) => (prev ? prev + ' ' + text : text))
  }, [])

  // 折叠态：只显示新建按钮
  if (!showForm) {
    return (
      <button
        className={styles.addBtn}
        onClick={() => setShowForm(true)}
      >
        <AddIcon size="20px" />
        <span>记录一次拖延</span>
      </button>
    )
  }

  const canSubmit = title.trim().length > 0 && !submitting

  return (
    <div className={`card ${styles.form}`}>
      <div className={styles.header}>
        <h3 className={styles.formTitle}>📝 记录拖延</h3>
        <button className={styles.cancelBtn} onClick={reset}>
          取消
        </button>
      </div>

      {/* 任务名 */}
      <div className={styles.field}>
        <input
          className={styles.input}
          type="text"
          placeholder="你要做什么任务？（比如：写期末论文）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          autoFocus
        />
        <span className={styles.charCount}>{title.length}/50</span>
      </div>

      {/* 拖延理由 + 语音 */}
      <div className={styles.field}>
        <div className={styles.reasonHeader}>
          <span className={styles.fieldLabel}>💬 拖延理由（选填）</span>
          <VoiceRecord onResult={handleVoiceResult} />
        </div>
        <textarea
          className={styles.textarea}
          placeholder="为什么不想做？怎么写都行..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={200}
          rows={3}
        />
      </div>

      {/* 情绪选择 */}
      <EmotionPicker value={emotion} onChange={setEmotion} />

      {/* 提交按钮 */}
      <button
        className={`${styles.submitBtn} ${canSubmit ? '' : styles.submitBtnDisabled}`}
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? '提交中...' : '✓ 提交记录'}
      </button>
    </div>
  )
}
