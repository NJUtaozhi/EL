import { ChevronLeftIcon, ChevronRightIcon } from 'tdesign-icons-react'
import { useState, useMemo } from 'react'
import dayjs from 'dayjs'

interface CheckinCalendarProps {
  /** 已打卡日期集合 (YYYY-MM-DD) */
  checkedDates: Set<string>
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

/**
 * 打卡月历 ⚪ 可选
 */
export default function CheckinCalendar({ checkedDates }: CheckinCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(dayjs())

  const goPrev = () => setCurrentMonth((m) => m.subtract(1, 'month'))
  const goNext = () => setCurrentMonth((m) => m.add(1, 'month'))

  const days = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week')
    const end = currentMonth.endOf('month').endOf('week')
    const result: dayjs.Dayjs[] = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      result.push(d)
      d = d.add(1, 'day')
    }
    return result
  }, [currentMonth])

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 月份切换 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <button onClick={goPrev} style={{ padding: 4, color: 'var(--text-secondary)' }}>
          <ChevronLeftIcon size="18px" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 600 }}>
          {currentMonth.format('YYYY年MM月')}
        </span>
        <button onClick={goNext} style={{ padding: 4, color: 'var(--text-secondary)' }}>
          <ChevronRightIcon size="18px" />
        </button>
      </div>

      {/* 星期头 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            style={{
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-light)',
              padding: '4px 0',
            }}
          >
            {w}
          </span>
        ))}
      </div>

      {/* 日期网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {days.map((d, i) => {
          const dateStr = d.format('YYYY-MM-DD')
          const checked = checkedDates.has(dateStr)
          const isCurrentMonth = d.month() === currentMonth.month()

          return (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '6px 0',
                opacity: isCurrentMonth ? 1 : 0.25,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  fontSize: 12,
                  fontWeight: checked ? 600 : 400,
                  color: checked ? '#fff' : 'var(--text-primary)',
                  background: checked ? 'var(--color-secondary)' : 'transparent',
                }}
              >
                {checked ? '✓' : d.date()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
