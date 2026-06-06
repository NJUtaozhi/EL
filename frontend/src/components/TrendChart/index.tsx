import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface TrendSeries {
  name: string
  data: Array<{ date: string; count: number }>
  color?: string
}

interface TrendChartProps {
  series: TrendSeries[]
  width?: number | string
  height?: number
}

/**
 * ECharts 趋势折线图
 * 展示干预前后拖延次数对比，或多条趋势线
 */
export default function TrendChart({ series, width = '100%', height = 260 }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || series.length === 0) return

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    // 收集所有日期并去重排序
    const allDates = [
      ...new Set(series.flatMap((s) => s.data.map((d) => d.date))),
    ].sort()

    const defaultColors = ['#AA96DA', '#A8D8EA', '#FCBAD3', '#B5EAD7', '#FFD4B8']

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: series.map((s) => s.name),
        bottom: 0,
        textStyle: { fontSize: 11, color: '#8C8C8C' },
        itemWidth: 12,
        itemHeight: 8,
      },
      grid: { top: 20, right: 20, bottom: 40, left: 40 },
      xAxis: {
        type: 'category',
        data: allDates,
        axisLabel: { fontSize: 10, color: '#8C8C8C', rotate: 30 },
        axisLine: { lineStyle: { color: '#E8E8E8' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { fontSize: 10, color: '#8C8C8C' },
        splitLine: { lineStyle: { color: '#F0F0F0', type: 'dashed' } },
      },
      series: series.map((s, i) => ({
        name: s.name,
        type: 'line',
        data: allDates.map((date) => {
          const found = s.data.find((d) => d.date === date)
          return found ? found.count : null
        }),
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2.5,
          color: s.color || defaultColors[i % defaultColors.length],
        },
        itemStyle: {
          color: s.color || defaultColors[i % defaultColors.length],
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: (s.color || defaultColors[i % defaultColors.length]).replace(
                ')',
                ', 0.3)'
              ).replace('rgb', 'rgba'),
            },
            { offset: 1, color: 'rgba(255,255,255,0)' },
          ]),
        },
      })),
    }

    instanceRef.current.setOption(option)

    const handleResize = () => instanceRef.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [series])

  useEffect(() => {
    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
  }, [])

  if (series.length === 0) return null

  return <div ref={chartRef} style={{ width, height }} />
}
