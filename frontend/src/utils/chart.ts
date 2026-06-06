/**
 * ECharts 通用配置
 * 治愈系配色主题
 */
export const CHART_COLORS = {
  primary: '#A8D8EA',
  secondary: '#AA96DA',
  accent: '#FCBAD3',
  warm: '#FFFFD2',
  green: '#B5EAD7',
  text: '#4A4A4A',
}

/** 治愈系色板数组 */
export const HEALING_PALETTE = [
  '#AA96DA', '#A8D8EA', '#FCBAD3', '#B5EAD7', '#FFD4B8',
  '#C4B5E8', '#C5E8F3', '#FDD5E5', '#8FD4B8', '#FFE0CC',
]

/** 通用 ECharts 初始化配置（含入场动画） */
export const baseChartOptions = {
  textStyle: { fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif', color: '#4A4A4A' },
  grid: { top: 20, right: 20, bottom: 30, left: 40 },
  animation: true,
  animationDuration: 800,
  animationEasing: 'cubicOut' as const,
}

/** 图表入场动画：从透明渐入 */
export const CHART_ENTER_ANIMATION = {
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicOut' as const,
  animationDelay: (idx: number) => idx * 80,
}

/** 通用 Tooltip 样式 */
export const healingTooltip = {
  backgroundColor: 'rgba(255,255,255,0.96)',
  borderColor: '#E8E8E8',
  borderWidth: 1,
  borderRadius: 8,
  padding: [8, 12],
  textStyle: { color: '#4A4A4A', fontSize: 12 },
  extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.08);',
}
