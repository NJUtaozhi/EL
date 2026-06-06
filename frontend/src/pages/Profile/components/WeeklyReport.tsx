import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import type { DashboardData } from '@/api/dashboard'
import styles from './WeeklyReport.module.css'

interface WeeklyReportProps {
  dashboard: DashboardData
}

/** 拖延类型 → 颜色映射 */
const TYPE_COLORS: Record<string, string> = {
  '畏难型': '#A8D8EA',
  '焦虑型': '#AA96DA',
  '贪玩型': '#FCBAD3',
  '无规划型': '#FFD4B8',
  '完美主义型': '#B5EAD7',
}

/**
 * 周报告
 * 拖延频率统计 + 类型分布饼图
 */
export default function WeeklyReport({ dashboard }: WeeklyReportProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  const typeEntries = Object.entries(dashboard.typeDistribution).filter(
    ([, v]) => v > 0
  )

  useEffect(() => {
    if (!chartRef.current || typeEntries.length === 0) return

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}次 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'center',
        textStyle: { fontSize: 11, color: '#8C8C8C' },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 12,
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            scaleSize: 8,
          },
          data: typeEntries.map(([name, value]) => ({
            name,
            value,
            itemStyle: { color: TYPE_COLORS[name] || '#BFBFBF' },
          })),
        },
      ],
    }

    instanceRef.current.setOption(option)

    const handleResize = () => instanceRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [typeEntries.map(([k, v]) => `${k}:${v}`).join(',')])

  useEffect(() => {
    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
  }, [])

  return (
    <div className={styles.report}>
      {/* 统计摘要 */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.sumNum}>{dashboard.weekTaskCount}</span>
          <span className={styles.sumLabel}>本周任务</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.summaryItem}>
          <span className={styles.sumNum}>{dashboard.weekCheckinDays}</span>
          <span className={styles.sumLabel}>打卡天数</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.summaryItem}>
          <span className={styles.sumNum}>{dashboard.totalTasks}</span>
          <span className={styles.sumLabel}>总计任务</span>
        </div>
      </div>

      {/* 饼图：类型分布 */}
      <div className={styles.chartSection}>
        <h4 className={styles.chartTitle}>拖延类型分布</h4>
        {typeEntries.length > 0 ? (
          <div ref={chartRef} style={{ width: '100%', height: 220 }} />
        ) : (
          <p className={styles.noData}>暂无归因数据</p>
        )}
      </div>
    </div>
  )
}
