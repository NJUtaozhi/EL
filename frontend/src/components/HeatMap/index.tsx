import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface HeatMapData {
  /** 星期几 0-6 (周日=0) */
  day: number
  /** 时段（如 '上午' | '下午' | '晚上'） */
  period: string
  /** 拖延次数 */
  value: number
}

interface HeatMapProps {
  data: HeatMapData[]
  width?: number | string
  height?: number
}

const DAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

/**
 * ECharts 热力图
 * 横轴：时段 × 纵轴：星期 = 拖延次数
 */
export default function HeatMap({ data, width = '100%', height = 280 }: HeatMapProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const periods = [...new Set(data.map((d) => d.period))].sort()
    const maxVal = Math.max(...data.map((d) => d.value), 1)

    const option: echarts.EChartsOption = {
      tooltip: {
        position: 'top',
        formatter: (params: unknown) => {
          const p = params as { data: number[] }
          if (!p.data) return ''
          return `${DAY_LABELS[p.data[1]]} · ${periods[p.data[0]]}<br/>拖延: ${p.data[2]}次`
        },
      },
      grid: { top: 10, right: 30, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: periods,
        splitArea: { show: true },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: DAY_LABELS,
        splitArea: { show: true },
        axisLabel: { fontSize: 11, color: '#8C8C8C' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: false,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: {
          color: ['#FAF9F6', '#C5E8F3', '#A8D8EA', '#AA96DA', '#8B7AC0'],
        },
        itemWidth: 12,
        itemHeight: 80,
        textStyle: { fontSize: 10, color: '#8C8C8C' },
      },
      series: [
        {
          type: 'heatmap',
          data: data.map((d) => [periods.indexOf(d.period), d.day, d.value]),
          label: {
            show: true,
            fontSize: 11,
            color: '#4A4A4A',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
            },
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            borderRadius: 4,
          },
        },
      ],
    }

    instanceRef.current.setOption(option)

    const handleResize = () => instanceRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [data])

  useEffect(() => {
    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
  }, [])

  if (data.length === 0) return null

  return <div ref={chartRef} style={{ width, height }} />
}
