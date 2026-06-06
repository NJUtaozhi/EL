import styles from './style.module.css'

/**
 * 首页仪表盘
 * Week 1: 基础框架
 * Week 4: 完整实现（今日任务数、连续打卡天数、最近拖延类型、快捷入口）
 */
export default function HomePage() {
  return (
    <div className={`page-container ${styles.home}`}>
      {/* 欢迎区域 */}
      <div className={`${styles.welcomeCard} healing-gradient`}>
        <h2 className={styles.greeting}>👋 欢迎回来</h2>
        <p className={styles.subtitle}>今天也要加油，不让拖延靠近你</p>
      </div>

      {/* 数据概览骨架 */}
      <div className={styles.statsRow}>
        <div className={`card ${styles.statCard}`}>
          <span className={styles.statNumber}>--</span>
          <span className={styles.statLabel}>今日任务</span>
        </div>
        <div className={`card ${styles.statCard}`}>
          <span className={styles.statNumber}>--</span>
          <span className={styles.statLabel}>连续打卡</span>
        </div>
        <div className={`card ${styles.statCard}`}>
          <span className={styles.statNumber}>--</span>
          <span className={styles.statLabel}>拖延记录</span>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className={styles.quickActions}>
        <button
          className={`card ${styles.actionBtn}`}
          onClick={() => (window.location.href = '/log')}
        >
          <span className={styles.actionIcon}>📝</span>
          <span className={styles.actionLabel}>记录拖延</span>
        </button>
        <button
          className={`card ${styles.actionBtn}`}
          onClick={() => (window.location.href = '/analysis')}
        >
          <span className={styles.actionIcon}>🔍</span>
          <span className={styles.actionLabel}>查看分析</span>
        </button>
        <button
          className={`card ${styles.actionBtn}`}
          onClick={() => (window.location.href = '/checkin')}
        >
          <span className={styles.actionIcon}>✅</span>
          <span className={styles.actionLabel}>每日打卡</span>
        </button>
      </div>
    </div>
  )
}
