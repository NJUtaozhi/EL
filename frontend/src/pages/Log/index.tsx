import styles from './style.module.css'

/**
 * 拖延日志页
 * Week 1: 基础框架占位
 * Week 2: 完整实现（任务列表 + 新建按钮 + TaskForm + EmotionPicker）
 */
export default function LogPage() {
  return (
    <div className={`page-container ${styles.log}`}>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>📝 拖延日志</h2>
        <p className={styles.pageDesc}>记录每一次拖延，了解自己</p>
      </div>

      {/* 空状态 */}
      <div className={`card ${styles.emptyState}`}>
        <span className={styles.emptyIcon}>📋</span>
        <p className={styles.emptyText}>还没有拖延记录</p>
        <p className={styles.emptyHint}>点击下方按钮开始记录你的第一次拖延</p>
        <button
          className={styles.addBtn}
          onClick={() => alert('任务表单将在第2周实现')}
        >
          + 新建任务
        </button>
      </div>
    </div>
  )
}
