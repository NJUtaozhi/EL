import { CheckCircleFilledIcon } from 'tdesign-icons-react'
import styles from './index.module.css'

interface CheckinButtonProps {
  onClick: () => void
  checkedIn: boolean
  loading?: boolean
}

/**
 * 打卡按钮
 * 点击 + 弹跳动画反馈
 */
export default function CheckinButton({
  onClick,
  checkedIn,
  loading = false,
}: CheckinButtonProps) {
  if (checkedIn) {
    return (
      <button className={`${styles.btn} ${styles.btnDone}`} disabled>
        <CheckCircleFilledIcon size="48px" className={styles.doneIcon} />
        <span className={styles.doneText}>今日已打卡</span>
      </button>
    )
  }

  return (
    <button
      className={`${styles.btn} ${styles.btnActive} ${loading ? styles.btnLoading : ''}`}
      onClick={onClick}
      disabled={loading}
    >
      <div className={styles.ripple}>
        <span className={styles.ripple1} />
        <span className={styles.ripple2} />
        <span className={styles.ripple3} />
      </div>
      <span className={styles.btnEmoji}>✅</span>
      <span className={styles.btnText}>
        {loading ? '打卡中...' : '今日打卡'}
      </span>
    </button>
  )
}
