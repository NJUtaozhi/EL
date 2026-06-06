import { useState } from 'react'
import { NotificationIcon } from 'tdesign-icons-react'

/**
 * 每日提醒设置 ⚪ 可选
 * 设置每日推送提醒时间
 */
export default function DailyReminder() {
  const [enabled, setEnabled] = useState(false)
  const [time, setTime] = useState('20:00')

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <NotificationIcon size="20px" style={{ color: 'var(--color-secondary)' }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600 }}>每日提醒</p>
        <p style={{ fontSize: 12, color: 'var(--text-light)' }}>
          每天提醒我查看干预建议
        </p>
      </div>
      {enabled && (
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.1)',
            fontSize: 13,
          }}
        />
      )}
      <button
        onClick={() => setEnabled(!enabled)}
        style={{
          padding: '6px 16px',
          borderRadius: 9999,
          fontSize: 13,
          fontWeight: 600,
          background: enabled ? 'var(--color-mint)' : 'var(--color-secondary)',
          color: enabled ? 'var(--text-primary)' : '#fff',
          transition: 'all 0.2s',
        }}
      >
        {enabled ? '已开启' : '开启'}
      </button>
    </div>
  )
}
