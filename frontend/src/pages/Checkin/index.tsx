/**
 * 打卡页
 * Week 1: 基础框架占位
 * Week 5: 完整实现（今日微行动 + 打卡日历 + 徽章墙）
 */
export default function CheckinPage() {
  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.35s ease forwards' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>✅ 每日打卡</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>坚持微行动，养成好习惯</p>
      </div>

      {/* 今日微行动 */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '24px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-warm))',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>今日最小行动</p>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>完成一项拖延任务</p>
        <button
          style={{
            background: 'var(--color-secondary)',
            color: '#fff',
            padding: '8px 32px',
            borderRadius: 9999,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          打卡
        </button>
      </div>

      {/* 打卡日历占位 */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 36 }}>📅</span>
        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>打卡日历即将上线</p>
      </div>
    </div>
  )
}
