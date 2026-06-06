import TrendChart from '@/components/TrendChart'

interface ProfileTrendCurveProps {
  taskData: Array<{ date: string; count: number }>
  checkinData: Array<{ date: string; count: number }>
}

/**
 * 画像页趋势曲线
 * 任务数 + 打卡数 双折线
 */
export default function ProfileTrendCurve({
  taskData,
  checkinData,
}: ProfileTrendCurveProps) {
  const hasData = taskData.length > 0 || checkinData.length > 0

  return (
    <div>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        📈 本周趋势
      </h3>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '12px 4px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {hasData ? (
          <TrendChart
            series={[
              { name: '拖延任务', data: taskData, color: '#AA96DA' },
              { name: '打卡天数', data: checkinData, color: '#A8D8EA' },
            ]}
            height={260}
          />
        ) : (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-light)',
              fontSize: 13,
              padding: '40px 0',
            }}
          >
            暂无本周数据
          </p>
        )}
      </div>
    </div>
  )
}
