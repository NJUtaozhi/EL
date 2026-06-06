import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import 'echarts-wordcloud'

interface TagCloudItem {
  name: string
  value: number
}

interface TagCloudProps {
  data: TagCloudItem[]
  width?: number | string
  height?: number
}

/**
 * 标签云（ECharts wordCloud 扩展）
 * 展示拖延关键词频率
 */
export default function TagCloud({ data, width = '100%', height = 240 }: TagCloudProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current)
    }

    const option: echarts.EChartsOption = {
      tooltip: { show: false },
      series: [
        {
          type: 'wordCloud',
          shape: 'circle',
          left: 'center',
          top: 'center',
          width: '90%',
          height: '90%',
          sizeRange: [14, 36],
          rotationRange: [-30, 30],
          rotationStep: 15,
          gridSize: 8,
          drawOutOfBound: false,
          layoutAnimation: true,
          textStyle: {
            fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
            fontWeight: 'normal',
            color: () => {
              const colors = [
                '#A8D8EA', '#AA96DA', '#FCBAD3', '#B5EAD7',
                '#FFD4B8', '#C5E8F3', '#C4B5E8', '#8FD4B8',
              ]
              return colors[Math.floor(Math.random() * colors.length)]
            },
          },
          emphasis: {
            textStyle: {
              fontWeight: 'bold',
            },
          },
          data: data.map((item) => ({
            name: item.name,
            value: item.value,
          })),
        },
      ],
    }

    instanceRef.current.setOption(option)

    const handleResize = () => instanceRef.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data])

  // 清理
  useEffect(() => {
    return () => {
      instanceRef.current?.dispose()
      instanceRef.current = null
    }
  }, [])

  if (data.length === 0) return null

  return (
    <div
      ref={chartRef}
      style={{ width, height, margin: '0 auto' }}
    />
  )
}
